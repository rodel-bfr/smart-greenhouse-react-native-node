# status_led.py (async)
import uasyncio as asyncio
import machine

led = machine.Pin("LED", machine.Pin.OUT)

async def blink(times, on_time=0.2, off_time=0.2):
    for _ in range(times):
        led.on()
        await asyncio.sleep(on_time)
        led.off()
        await asyncio.sleep(off_time)

async def led_startup():
    print("LED: Startup sequence")
    await blink(3, 0.5, 0.5)

async def led_wifi_connecting():
    print("LED: Connecting to WiFi...")
    for _ in range(10):
        led.on()
        await asyncio.sleep(0.2)
        led.off()
        await asyncio.sleep(0.2)

async def led_wifi_connected():
    print("LED: WiFi connected")
    led.on()
    await asyncio.sleep(2)
    led.off()

async def led_sending():
    print("LED: Sending data")
    await blink(2, 0.1, 0.1)

async def led_error():
    print("LED: ERROR (infinite blink)")
    while True:
        led.on()
        await asyncio.sleep(1.0)
        led.off()
        await asyncio.sleep(0.2)

async def led_heartbeat():
    while True:
        led.on()
        await asyncio.sleep(0.05)
        led.off()
        await asyncio.sleep(2)


# ===== test =====
if __name__ == "__main__":
    led.on()
    led.off()