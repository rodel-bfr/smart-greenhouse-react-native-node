import machine
import time

# === CONFIGURATION ===
PUMP_PIN = 14  # Irigation system - GP14
FAN_PIN = 15   # Ventilation system - GP15


# === INITIALIZATION ===
pump = machine.Pin(PUMP_PIN, machine.Pin.OUT)
fan = machine.Pin(FAN_PIN, machine.Pin.OUT)


# === CONTROL FUNCTIONS ===
def set_pump(state: bool):
    pump.value(1 if state else 0)

def set_fan(state: bool):
    fan.value(1 if state else 0)


# === STATUS CHECK ===
def get_pump_state() -> bool:
    return bool(pump.value())

def get_fan_state() -> bool:
    return bool(fan.value())



# === TEST SCRIPT ===
if __name__ == "__main__":
    import time

    print("Testing Actuator Control Module...")

    print("Turning pump ON for 2 seconds...")
    set_pump(1)
    time.sleep(2)
    set_pump(0)

    print("Turning fan ON for 2 seconds...")
    set_fan(1)
    time.sleep(2)
    set_fan(0)

    print("Test complete.")