#!/usr/bin/env python3
"""Upload KabarDesk to VPS without disturbing existing sites."""
from __future__ import annotations

import io
import os
import re
import tarfile
import time
from pathlib import Path

import paramiko

HOST = "23.88.20.96"
USER = "root"
REMOTE_DIR = "/var/www/kabardesk"
PM2_NAME = "kabardesk"
# Dedicated HTTP port — avoids nginx default_server and typical :3000 apps
INTERNAL_PORT = 3010
PUBLIC_PORT = INTERNAL_PORT  # exposed directly; Caddy owns :80/:443
ROOT = Path(__file__).resolve().parents[1]

EXCLUDE = {
    "node_modules",
    ".next",
    ".git",
    "prisma/dev.db",
    "prisma/dev.db-journal",
    "scripts/.deploy-secret",
    "scripts/.auth-secret",
    "scripts/.superadmin-credentials",
    "scripts/deploy_ed25519",
}


def password() -> str:
    return Path(__file__).with_name(".deploy-secret").read_text(encoding="utf-8").strip()


def connect(client: paramiko.SSHClient) -> None:
    key_path = Path(__file__).with_name("deploy_ed25519")
    if key_path.exists():
        try:
            pkey = paramiko.Ed25519Key.from_private_key_file(str(key_path))
            client.connect(
                HOST,
                username=USER,
                pkey=pkey,
                timeout=30,
                allow_agent=False,
                look_for_keys=False,
            )
            return
        except paramiko.AuthenticationException:
            pass
    client.connect(
        HOST,
        username=USER,
        password=password(),
        timeout=30,
        allow_agent=False,
        look_for_keys=False,
    )


def make_tarball() -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for path in ROOT.rglob("*"):
            rel = path.relative_to(ROOT).as_posix()
            if any(part in EXCLUDE for part in path.parts):
                continue
            if path.name in EXCLUDE:
                continue
            if path.is_file():
                tar.add(path, arcname=rel)
    buf.seek(0)
    return buf.read()


def run(client: paramiko.SSHClient, cmd: str, check: bool = True) -> str:
    print(f"$ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    code = stdout.channel.recv_exit_status()
    if out:
        print(out.encode("utf-8", errors="replace").decode("utf-8", errors="replace"))
    if err:
        print(err.encode("utf-8", errors="replace").decode("utf-8", errors="replace"))
    if check and code != 0:
        raise RuntimeError(f"Command failed ({code}): {cmd}")
    return out


def pick_internal_port(client: paramiko.SSHClient) -> int:
    out = run(client, "ss -tlnH | awk '{print $4}'", check=False)
    used = set()
    for line in out.splitlines():
        m = re.search(r":(\d+)$", line.strip())
        if m:
            used.add(int(m.group(1)))
    port = INTERNAL_PORT
    while port in used:
        port += 1
    return port


def load_superadmin() -> tuple[str, str]:
    path = Path(__file__).with_name(".superadmin-credentials")
    if not path.exists():
        return "", ""
    lines = path.read_text(encoding="utf-8").strip().splitlines()
    if len(lines) < 2:
        return "", ""
    return lines[0].strip().lower(), lines[1].strip()


def load_auth_secret() -> str:
    path = Path(__file__).with_name(".auth-secret")
    if path.exists():
        return path.read_text(encoding="utf-8").strip()
    secret = os.urandom(32).hex()
    path.write_text(secret, encoding="utf-8")
    return secret


def main() -> None:
    auth_secret = load_auth_secret()
    super_email, super_password = load_superadmin()
    site_url = f"http://{HOST}:{PUBLIC_PORT}"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    connect(client)

    # Minimal installs — do not reinstall nginx globally or replace default site
    run(
        client,
        "command -v node >/dev/null || (curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs)",
        check=False,
    )
    run(client, "command -v pm2 >/dev/null || npm install -g pm2", check=False)

    # Free our previous listener so pick_internal_port can reuse INTERNAL_PORT.
    run(client, f"pm2 delete {PM2_NAME} 2>/dev/null || true", check=False)
    time.sleep(1)

    internal_port = pick_internal_port(client)
    if internal_port != PUBLIC_PORT:
        print(
            f"Warning: port {PUBLIC_PORT} busy; app on {internal_port} "
            f"but URLs still target {PUBLIC_PORT}",
        )
    print(f"Using app port {internal_port} (public URL port {PUBLIC_PORT})")

    run(client, f"mkdir -p {REMOTE_DIR}")
    tarball = make_tarball()
    sftp = client.open_sftp()
    remote_tar = f"{REMOTE_DIR}/release.tgz"
    with sftp.file(remote_tar, "wb") as f:
        f.write(tarball)
    sftp.close()

    app_url = f"http://{HOST}:{internal_port}"
    db_path = f"{REMOTE_DIR}/prisma/dev.db"
    env_content = f"""DATABASE_URL="file:{db_path}"
AUTH_SECRET="{auth_secret}"
AUTH_URL="{app_url if internal_port == PUBLIC_PORT else site_url}"
NEXTAUTH_URL="{app_url if internal_port == PUBLIC_PORT else site_url}"
NEXT_PUBLIC_SITE_URL="{site_url}"
PORT={internal_port}
HOSTNAME=0.0.0.0
NODE_ENV=production
AUTH_SECURE_COOKIES=false
"""
    if super_email and super_password:
        env_content += f'KABARDESK_SUPERADMIN_EMAIL="{super_email}"\n'
        env_content += f'KABARDESK_SUPERADMIN_PASSWORD="{super_password}"\n'
    run(
        client,
        f"mkdir -p {REMOTE_DIR} && cd {REMOTE_DIR} && "
        f"rm -rf src .next && tar xzf release.tgz && rm -f release.tgz",
    )
    run(
        client,
        f"cat > {REMOTE_DIR}/.env << 'ENVEOF'\n{env_content}ENVEOF",
    )
    run(client, f"cd {REMOTE_DIR} && npm install && npm run setup && npm run build")
    run(
        client,
        f"cd {REMOTE_DIR} && pm2 delete {PM2_NAME} 2>/dev/null; PORT={internal_port} pm2 start npm --name {PM2_NAME} -- start && pm2 save",
        check=False,
    )

    # Server uses Caddy on 80/443 — do not touch Caddyfile. App listens on {internal_port} only.
    run(
        client,
        f"curl -sI {site_url} | head -5",
        check=False,
    )

    time.sleep(3)
    run(client, f"curl -sI {site_url} | head -8", check=False)
    client.close()
    print(f"\nDeployed (no conflict with port 80 sites): {site_url}")
    print("Admin: admin@kabardesk.id / admin123")


if __name__ == "__main__":
    main()
