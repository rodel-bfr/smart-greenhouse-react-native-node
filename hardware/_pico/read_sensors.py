import machine
import time
import math

# === CONFIGURATION ===
# Thermistor parameters
THERMISTOR_PIN = 28  # ADC2
BETA = 3950          # Beta coefficient from datasheet
R0 = 10000           # Resistance at T0 (10kΩ at 25°C)
T0 = 25 + 273.15     # Reference temperature in Kelvin
VCC = 3.3            # Supply voltage
SERIES_RESISTOR = 10000  # Series resistor value

# Humidity (potentiometer for testing)
HUMIDITY_PIN = 27  # ADC1

# Soil moisture (potentiometer for testing)
SOIL_PIN = 26  # ADC0

# set ADC channels for sensors
adc_temp = machine.ADC(machine.Pin(THERMISTOR_PIN))
adc_humidity = machine.ADC(machine.Pin(HUMIDITY_PIN))
adc_soil = machine.ADC(machine.Pin(SOIL_PIN))


# === SENSOR FUNCTIONS ===
def read_temperature():
    """
    Reads the thermistor ADC value and converts it to temperature in °C.
    """
    try:
        adc_value = adc_temp.read_u16()
        voltage = (adc_value / 65535) * VCC

        if voltage <= 0:
            return None  # avoid division by zero
        resistance = SERIES_RESISTOR * (VCC / voltage - 1)

        temperature_k = 1 / ((1 / BETA) * math.log(resistance / R0) + (1 / T0))
        temperature_c = temperature_k - 273.15
        
        return round(temperature_c, 2)
    except Exception as e:
        print("Temperature read error:", e)
        return None  # math domain error if invalid reading


def read_humidity():
    """
    Reads humidity from a potentiometer (0–3.3V) and converts to percentage.
    """
    adc_value = adc_humidity.read_u16()
    humidity_percent = (adc_value / 65535) * 100
    return round(humidity_percent, 1)


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