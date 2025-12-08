import machine
import time
import am2320

# === I2C CONFIGURATION ===
# AM2320 uses I²C, connect SDA → GP0, SCL → GP1
i2c = machine.I2C(0, sda=machine.Pin(0), scl=machine.Pin(1), freq=100_000)
am = am2320.AM2320(i2c)

# Soil moisture (potentiometer for testing)
SOIL_PIN = 26  # ADC0
adc_soil = machine.ADC(machine.Pin(SOIL_PIN))


# === SENSOR FUNCTIONS ===
def read_temperature():
    """
    Reads temperature from AM2320 sensor in °C.
    """
    try:
        am.measure()
        return round(float(am.temperature()), 2)
    except Exception as e:
        print("Temperature read error:", e)
        return None


def read_humidity():
    """
    Reads realtive humidity from AM2320 sensor in %.
    """
    try:
        am.measure()
        return round(float(am.humidity()),1)
    except Exception as e:
        print("Humidity read error:", e)
        return None


def read_soil_moisture():
    """
    Reads soil moisture from a potentiometer (0–3.3V) and converts to percentage.
    """
    adc_value = adc_soil.read_u16()
    soil_percent = (adc_value / 65535) * 100
    return round(soil_percent, 1)


# === TEST LOOP ===
if __name__ == "__main__":
    while True:
        temp = read_temperature()
        humidity = read_humidity()
        soil = read_soil_moisture()

        if temp is not None:
            print(f"Temperature: {temp}°C | Humidity: {humidity}% | Soil: {soil}%")
        else:
            print("Temperature sensor error")

        time.sleep(1)
