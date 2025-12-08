import uasyncio as asyncio
from actuator_control import get_pump_state, get_fan_state

# # === INITIALIZATION ===
pump = get_pump_state()
fan = get_fan_state()

def actuator_state():
    return f"[ACT STATE] Pump: {pump}  Fan: {fan}"

# ==== display simulation ====
async def test_display_task():
# def test_display_task():
    while True:
        global pump, fan
        
        pump = get_pump_state()
        fan = get_fan_state() 
        
        if pump and fan:
            print(actuator_state())
            print("[DISPLAY] Both on: blink full digits 1 & 4")
        elif pump:  # vertical line (right to left)
            print(actuator_state())
            print("[DISPLAY] Pump on: vertical line (right to left)")
        elif fan:  # horizontal line (right to left)
            print(actuator_state())
            print("[DISPLAY] Fan on: horizontal line (right to left)")
        else:  # both off → middle bar
            print(actuator_state())
            print("[DISPLAY] Both off: middle bar")
        
        await asyncio.sleep(2)
    
        
if __name__ == "__main__":
    test_display_task()