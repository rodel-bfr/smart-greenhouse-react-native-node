# ===== main.py (async) =====
import gc
import time
import uasyncio as asyncio
from data_transfer import wifi_connection, api_client
import read_sensors
import actuator_control
from helpers import test_display
# from actuator_control_display import display_task
import status_led
from config import (
    SEND_INTERVAL, CHANGE_THRESHOLD, TEMP_THRESHOLD,
    SOIL_MOISTURE_THRESHOLD, COMMAND_POLL_INTERVAL,
    OVERRIDE_TIMEOUT, GC_INTERVAL, WIFI_CHECK_INTERVAL
)

# ===== GC SETUP =====
gc.threshold(gc.mem_free() // 4)  # auto GC when memory drops below 25%

# ===== STATE =====
last_temp = None
last_humidity = None
last_soil = None
last_pump_state = None
last_fan_state = None

manual_override_pump = False
manual_override_fan = False
last_command_time = 0   # Timestamp of last backend command


# ===== AUTO CONTROL =====
def auto_control(temp, soil):
    global last_pump_state, last_fan_state
    global manual_override_pump, manual_override_fan
    
    now = time.time()
    override_expired = (now - last_command_time > OVERRIDE_TIMEOUT)
    
    if override_expired:
        manual_override_pump = False
        manual_override_fan = False

    # Pump control (only if not overridden)
    if not manual_override_pump:
        desired_pump = soil < SOIL_MOISTURE_THRESHOLD
        if desired_pump != last_pump_state:
            actuator_control.set_pump(desired_pump)
            last_pump_state = desired_pump
            print(f"Auto: Pump {'ON' if desired_pump else 'OFF'} (soil={soil:.1f}%)")

    # Fan control (only if not overridden)
    if not manual_override_fan:
        desired_fan = temp > TEMP_THRESHOLD
        if desired_fan != last_fan_state:
            actuator_control.set_fan(desired_fan)
            last_fan_state = desired_fan
            print(f"Auto: Fan {'ON' if desired_fan else 'OFF'} (temp={temp:.1f}°C)")


# ===== ASYNC TASKS =====
async def sensor_task():
    """Reads sensors and sends updates at fixed interval."""
    global last_temp, last_humidity, last_soil
    while True:
        try:
            temp = read_sensors.read_temperature()
            humidity = read_sensors.read_humidity()
            soil = read_sensors.read_soil_moisture()

            # run auto control logic
            auto_control(temp, soil)

            # send if changed beyond threshold
            if (last_temp is None or abs(temp - last_temp) > CHANGE_THRESHOLD or
                last_humidity is None or abs(humidity - last_humidity) > CHANGE_THRESHOLD or
                last_soil is None or abs(soil - last_soil) > CHANGE_THRESHOLD):

                payload = {
                    "temp": temp,
                    "humidity": humidity,
                    "soil_moisture": soil
                }
                print("Sending sensor update:", payload)
                # async POST
                await api_client.api_post_manual(payload)
                # LED feedback (async)
                await status_led.led_sending()

                last_temp = temp
                last_humidity = humidity
                last_soil = soil

        except Exception as e:
            print("Error in sensor_task:", e)
            # spawn LED error indicator (non-blocking)
            asyncio.create_task(status_led.led_error())

        await asyncio.sleep(SEND_INTERVAL)


async def command_task():
    """Polls backend for actuator commands."""
    global last_pump_state, last_fan_state
    global manual_override_pump, manual_override_fan, last_command_time

    while True:
        try:
            commands = await api_client.api_get_manual()
            if commands:
                print("Received commands:", commands) # ---- check if gets commands
                last_command_time = time.time()

                # Pump
                if "pump" in commands:
                    pump_cmd = bool(commands["pump"])
                    if manual_override_pump != pump_cmd:
                        if pump_cmd != last_pump_state:
                            actuator_control.set_pump(pump_cmd)
                            print(f"Pump manually set to {pump_cmd}")
                            last_pump_state = pump_cmd
                        manual_override_pump = pump_cmd
                        # manual_override_pump = True  # override only if pump ON (True); original: ... = pump_cmd
                
                # fan
                if "fan" in commands:
                    fan_cmd = bool(commands["fan"])
                    if manual_override_fan != fan_cmd:
                        if fan_cmd != last_fan_state:
                            actuator_control.set_fan(fan_cmd)
                            print(f"Fan manually set to {fan_cmd}")
                            last_fan_state = fan_cmd
                        manual_override_fan = fan_cmd
                        # manual_override_pump = True  # override only if pump ON (True); original: ... = pump_cmd

        except Exception as e:
            print("Error in command_task:", e)
            asyncio.create_task(status_led.led_error())

        await asyncio.sleep(COMMAND_POLL_INTERVAL)


async def initial_sync():
    """Fetch and apply initial backend state before auto-control starts."""
    global last_pump_state, last_fan_state
    global manual_override_pump, manual_override_fan, last_command_time

    try:
        commands = await api_client.api_get_manual()
        if commands:
            print("[SYNC] Initial backend state:", commands)
            last_command_time = time.time()

            # Pump
            if "pump" in commands:
                pump_cmd = bool(commands["pump"])
                manual_override_pump = pump_cmd
                actuator_control.set_pump(pump_cmd)
                last_pump_state = pump_cmd
                print(f"[SYNC] Pump set to {pump_cmd}")

            # Fan
            if "fan" in commands:
                fan_cmd = bool(commands["fan"])
                manual_override_fan = fan_cmd
                actuator_control.set_fan(fan_cmd)
                last_fan_state = fan_cmd
                print(f"[SYNC] Fan set to {fan_cmd}")

        else:
            print("[SYNC] No initial commands received, defaulting to auto-control.")

    except Exception as e:
        print("[SYNC ERROR]", e)
        
        
async def led_task():
    """Background heartbeat LED (non-blocking)."""
    await status_led.led_heartbeat()  # this function yields forever
    
    
async def gc_task():
    """Force garbage collection periodically."""
    while True:
        try:
            gc.collect()
            print(f"[GC] Free RAM: {gc.mem_free()} bytes")
        except Exception as e:
            print("[GC ERROR]", e)
        await asyncio.sleep(GC_INTERVAL)
        

async def wifi_monitor_task():
    """Ensure Wifi stays connected"""
    while True:
        try:
            if not wifi_connection.is_connected():
                print("[WiFi] Lost connection. Reconnecting...")
                await wifi_connection.connect_wifi()
                await status_led.led_wifi_connected()
        except Exception as e:
            print("Wifi monitor error:", e)
        await asyncio.sleep(WIFI_CHECK_INTERVAL)
        


# ===== MAIN =====
async def main():      
    # LED startup sequence
    await status_led.led_startup()

    # WiFi connect (async)
    await wifi_connection.connect_wifi()
    await status_led.led_wifi_connected()
    
    await initial_sync()

    # Run all tasks concurrently
    await asyncio.gather(
        sensor_task(),
        command_task(),
        led_task(),
        gc_task(),
        wifi_monitor_task(),
        test_display.test_display_task(),
#         display_task(),
    )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print("Fatal error in main:", e)
        try:
            import uasyncio as _a
            _a.run(status_led.led_error())
        except Exception:
            pass
 