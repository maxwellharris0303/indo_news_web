import sys
from pathlib import Path

import paramiko

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

HOST = "23.88.20.96"
USER = "root"


def main() -> None:
    secret = Path(__file__).with_name(".deploy-secret").read_text(encoding="utf-8").strip()
    cmd = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "uname -a"
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        HOST,
        username=USER,
        password=secret,
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
    )
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    def safe(s: str) -> str:
        return s.encode("utf-8", errors="replace").decode("utf-8", errors="replace")

    if out:
        print(safe(out), end="" if out.endswith("\n") else "\n")
    if err:
        print(safe(err), file=sys.stderr, end="" if err.endswith("\n") else "\n")
    client.close()
    raise SystemExit(code)


if __name__ == "__main__":
    main()
