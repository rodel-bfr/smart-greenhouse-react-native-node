import uasyncio as asyncio
import urequests
import usocket as socket, ssl
from data_transfer import secrets

BASE_URL = secrets.SERVER_URL
DEVICE_ID = secrets.DEVICE_ID
# header-ul de securitate (aceeași valoare ca în .env → DEVICE_API_KEY)
HEADERS = secrets.HEADERS

# async def api_post(payload):    # <--- real
#     """
#     Async POST wrapper. Uses urequests internally (blocking),
#     but runs inside a thread/task so it won't block uasyncio loop.
#     """
#     url = f"{BASE_URL}/api/data/{DEVICE_ID}"
#     try:
#         r = urequests.post(url, json=payload, headers=HEADERS)
#         data = r.json()
#         r.close()
#         return data
#     except Exception as e:
#         print(f"POST {url} failed:", e)
#         return None


async def api_post_manual(payload):
    import ujson

    host = "smartgreenhouse.online"
    port = 443
    path = f"/api/data/{DEVICE_ID}"

    addr_info = socket.getaddrinfo(host, port)
    addr = addr_info[0][-1]
    s = socket.socket()
    s.connect(addr)
    s = ssl.wrap_socket(s)

    api_key = HEADERS.get("x-api-key")
    body = ujson.dumps(payload)
    content_length = len(body)

    req = (
        f"POST {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        f"X-Api-Key: {api_key}\r\n"
        f"User-Agent: PicoClient/1.0\r\n"
        f"Accept: application/json\r\n"
        f"Content-Type: application/json\r\n"
        f"Content-Length: {content_length}\r\n"
        f"Connection: close\r\n"
        f"\r\n"
        f"{body}"
    )

#     print("=== REQUEST SENT ===")
#     print(req)

    s.write(req.encode())

    resp = b""
    while True:
        data = s.read(512)
        if not data:
            break
        resp += data
    s.close()

#     print("=== RAW RESPONSE ===")
#     print(resp.decode())

    try:
        body = resp.split(b"\r\n\r\n", 1)[1]
        return ujson.loads(body)
    except Exception:
        return {"raw": resp}
    
    
async def api_get_manual():
    import ujson

    host = "smartgreenhouse.online"
    port = 443
    path = f"/api/data/{DEVICE_ID}/commands"

    addr_info = socket.getaddrinfo(host, port)
    addr = addr_info[0][-1]
    s = socket.socket()
    s.connect(addr)
    s = ssl.wrap_socket(s)

    api_key = HEADERS.get("x-api-key")

    req = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        f"X-Api-Key: {api_key}\r\n"
        f"User-Agent: PicoClient/1.0\r\n"
        f"Accept: application/json\r\n"
        f"Connection: close\r\n"
        f"\r\n"
    )

#     print("=== REQUEST SENT ===")
#     print(req)

    s.write(req.encode())

    resp = b""
    while True:
        data = s.read(512)
        if not data:
            break
        resp += data
    s.close()

#     print("=== RAW RESPONSE ===")
#     print(resp.decode())

    try:
        body = resp.split(b"\r\n\r\n", 1)[1]
        return ujson.loads(body)
    except Exception:
        return {"raw": resp}