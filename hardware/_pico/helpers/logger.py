# ===== LOGGER =====
# Logger is not implemented in the MVP
import time

def log(msg, level="INFO"):
    ts = time.time()
    print(f"[{level}] {ts}: {msg}")

def info(msg):
    log(msg, "INFO")

def warn(msg):
    log(msg, "WARN")

def error(msg):
    log(msg, "ERROR")