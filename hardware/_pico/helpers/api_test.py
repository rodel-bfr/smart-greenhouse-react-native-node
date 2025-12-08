# ====== test.py =======
import usocket as socket, ssl
import time
import gc
import urequests
from data_transfer import wifi_connection, secrets

BASE_URL = secrets.SERVER_URL
DEVICE_ID = secrets.DEVICE_ID
HEADERS = secrets.HEADERS

def ram_usage():
    # print RAM usage
    print(f"Free RAM: {gc.mem_free()} bytes")
    print(f"Allocated RAM: {gc.mem_alloc()} bytes")

# def api_post(payload):
#     url = f"{BASE_URL}/api/data/{DEVICE_ID}"
#     try:
#         r = urequests.post(url, json=payload, headers=HEADERS)
#         data = r.json()
#         r.close()
#         return data
#     except Exception as e:
#         print(f"POST {url} failed:", e)
#         return None


def api_post_manual(payload):
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


# def api_get():
#     url = f"{BASE_URL}/api/data/{DEVICE_ID}/commands"
#     try:
#         r = urequests.request("GET", url, headers=HEADERS)
#         data = r.json()
#         r.close()
#         return data
#     except Exception as e:
#         print(f"GET {url} failed:", e)
#         return None


# def api_get():
#     url = f"{BASE_URL}/api/data/{DEVICE_ID}/commands"
#     try:
#         r = urequests.request("GET", url, headers=HEADERS)
#         text = r.text  # read raw response
#         r.close()
#         try:
#             return ujson.loads(text)
#         except Exception:
#             print("GET returned non-JSON:", text)
#             return {"raw": text}
#     except Exception as e:
#         print(f"GET {url} failed:", e)
#         return None

# def api_get_manual():
#     host = "smartgreenhouse.online"
#     port = 443
#     path = f"/api/data/{DEVICE_ID}/commands"
# 
#     addr_info = socket.getaddrinfo(host, port)
#     addr = addr_info[0][-1]
#     s = socket.socket()
#     s.connect(addr)
#     s = ssl.wrap_socket(s)
# 
#     api_key = HEADERS.get("x-api_key")
#     
#     req = (
#         f"GET {path} HTTP/1.1\r\n"
#         f"Host: {host}\r\n"
#         f"x-api-key: {api_key}\r\n"
#         f"Accept: application/json\r\n"
#         f"\r\n"
#     )
#     s.write(req.encode())
# 
#     resp = b""
#     while True:
#         data = s.read(512)
#         if not data:
#             break
#         resp += data
#     s.close()
# 
#     try:
#         body = resp.split(b"\r\n\r\n", 1)[1]  # remove headers
#         return ujson.loads(body)
#     except Exception:
#         return {"raw": resp}
#     

def api_get_manual():
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
    

def main():
    wifi_connection.connect_wifi()
    
    ram_usage()
    
    for _ in range(2):
        try:
            payload = {
                        "temp": 25.0,
                        "humidity": 60,
                        "soil_moisture": 75,
            }
            
            
            post_response = api_post_manual(payload)
            print("POST response:", post_response)
            ram_usage()

#             get_response = api_get()
            get_response = api_get_manual()
            print("GET response:", get_response)
            ram_usage()
        except Exception as e:
            print("main loop error:", e)
            
        time.sleep(1)
                    

if __name__ == "__main__":
    main()
