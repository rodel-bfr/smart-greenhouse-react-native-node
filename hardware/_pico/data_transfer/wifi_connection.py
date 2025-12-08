# wifi_connection.py (async)
import network
import uasyncio as asyncio
import rp2
from data_transfer import secrets

rp2.country("RO")

async def connect_wifi(timeout=15):
    """
    Async connect to Wi-Fi. Call with `await wifi_connection.connect_wifi()`.
    """
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(secrets.SSID, secrets.PSK)

    max_wait = timeout
    while max_wait > 0:
        # network status codes differ between builds; use isconnected() as primary check
        if wlan.isconnected():
            break
        # optional: print progress
        print("Connecting to Wi-Fi...")
        await asyncio.sleep(1)
        max_wait -= 1

    if not wlan.isconnected():
        raise RuntimeError("Wi-Fi connection failed!")
    print("Connected: ", wlan.ifconfig())
    return wlan


def is_connected():
    """
    Returns True if Wi-Fi is currently connected, False otherwise.
    """
    wlan = network.WLAN(network.STA_IF)
    return wlan.isconnected()