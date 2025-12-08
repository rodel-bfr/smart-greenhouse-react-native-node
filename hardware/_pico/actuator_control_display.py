import machine
import uasyncio as asyncio
from actuator_control import get_pump_state, get_fan_state

# === INITIALIZATION ===
pump = get_pump_state()
fan = get_fan_state()

# === DISPLAY SETUP ===
segments = {
    'A': machine.Pin(10, machine.Pin.OUT),
    'B': machine.Pin(11, machine.Pin.OUT),
    'C': machine.Pin(12, machine.Pin.OUT),
    'D': machine.Pin(13, machine.Pin.OUT),
    'E': machine.Pin(14, machine.Pin.OUT),
    'F': machine.Pin(15, machine.Pin.OUT),
    'G': machine.Pin(16, machine.Pin.OUT),
    'DP': machine.Pin(17, machine.Pin.OUT),
}
digits = [machine.Pin(6, machine.Pin.OUT), machine.Pin(7, machine.Pin.OUT),
          machine.Pin(8, machine.Pin.OUT), machine.Pin(9, machine.Pin.OUT)]

# --- Helpers ---
def _all_digits_off():
    for d in digits: d.value(1)

def _clear_segments():
    for s in segments.values(): s.value(0)

def _set_segments(seg_list):
    _clear_segments()
    for s in seg_list: segments[s].value(1)


# === DISPLAY TASK ===
async def display_task():
    while True:
        global pump, fan
        
        pump = get_pump_state()
        fan = get_fan_state() 
        
        _all_digits_off()
        _clear_segments()
        # both ON → blink full digits 1 & 4
        if pump and fan:
            for i, d in enumerate(digits):
                if i in [0, 3]:
                    _set_segments(['A','B','C','D','E','F','G'])
                    d.value(0)
                    await asyncio.sleep_ms(250)
                    _all_digits_off()
                    _clear_segments()
                    await asyncio.sleep_ms(250)
                else:
                    _set_segments(['G'])
                    d.value(0)
            await asyncio.sleep_ms(50)
        elif pump:  # vertical line (right to left)
            seq = [['B','C'], ['F','E']]
            for s in seq:
                for i, d in enumerate(digits):
                    _set_segments(s)
                    d.value(0)
                    await asyncio.sleep_ms(50)
        elif fan:  # horizontal line (right to left)
            seq = [['A'], ['G'], ['D']]
            for s in seq:
                for i, d in enumerate(digits):
                    _set_segments(s)
                    d.value(0)
                    await asyncio.sleep_ms(50)
        else:  # both off → middle bar
            for i, d in enumerate(digits):
                _set_segments(['G'])
                d.value(0)
                await asyncio.sleep_ms(50)
