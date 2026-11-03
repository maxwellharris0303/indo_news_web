#!/usr/bin/env python3
"""Run a command on the KabarDesk VPS (optionally upload files first)."""
from __future__ import annotations

import sys
from pathlib import Path

import paramiko

_SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPTS))
from deploy_vps import REMOTE_DIR, ROOT, connect, run  # noqa: E402

def main() -> None:
    upload: list[Path] = []
    args = sys.argv[1:]
    if args and args[0] == "--upload":
        args = args[1:]
        while args and args[0] != "--":
            rel = args.pop(0)
            upload.append(ROOT / rel)
        if args and args[0] == "--":
            args = args[1:]
        if not args:
            print(
                "Usage: vps_run.py --upload rel/path [...] -- 'remote command'",
            )
            sys.exit(2)

    if not args:
        print("Usage: vps_run.py [--upload rel/path ...] 'remote command'")
        sys.exit(2)

    remote_cmd = " ".join(args)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    connect(client)

    if upload:
        sftp = client.open_sftp()
        for path in upload:
            if not path.is_file():
                print(f"Missing file: {path}")
                sys.exit(1)
            remote = f"{REMOTE_DIR}/{path.relative_to(ROOT).as_posix()}"
            sftp.put(str(path), remote)
            print(f"Uploaded {path.relative_to(ROOT).as_posix()}")
        sftp.close()

    run(client, remote_cmd, check=False)
    client.close()


if __name__ == "__main__":
    main()
