import socket
from pathlib import Path

import paramiko

secret = Path(__file__).with_name(".deploy-secret").read_text(encoding="utf-8").strip()

sock = socket.create_connection(("23.88.20.96", 22), timeout=15)
t = paramiko.Transport(sock)
t.start_client()

try:
    def handler(title, instructions, prompt_list):
        return [secret if "password" in p.lower() else "" for p in prompt_list]

    t.auth_interactive("root", handler)
    print("interactive auth OK")
except Exception as e:
    print("interactive failed", type(e).__name__, e)

try:
    t.auth_password("root", secret)
    print("password auth OK")
except Exception as e:
    print("password auth failed", type(e).__name__, e)

t.close()
