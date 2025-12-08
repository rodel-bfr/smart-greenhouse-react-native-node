# ===== CONFIG =====
# Sensor intervals
SEND_INTERVAL = 1.0             # Seconds between sensor uploads
CHANGE_THRESHOLD = 0.5          # Change detection threshold
COMMAND_POLL_INTERVAL = 1.0     # Seconds between command checks
GC_INTERVAL = 60                # Seconds between forced garbage collections
WIFI_CHECK_INTERVAL = 10        # Seconds between WiFi checks

# Auto control thresholds
TEMP_THRESHOLD = 36.0           # °C - turn fan ON above this
SOIL_MOISTURE_THRESHOLD = 30.0  # % - turn pump ON below this

# Override behavior
OVERRIDE_TIMEOUT = 300          # Seconds before auto-control resumes (5 min)