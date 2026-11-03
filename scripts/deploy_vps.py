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
    "dev.db",
    "dev.db-journal",
    "ci.db",
    "ci.db-journal",
    "scripts/.deploy-secret",
    "scripts/.auth-secret",
    "scripts/.superadmin-credentials",
    "scripts/deploy_ed25519",
}


def should_skip_tar_path(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    if any(part in EXCLUDE for part in path.parts):
        return True
    if path.name in EXCLUDE:
        return True
    if path.suffix == ".db" or path.name.endswith(".db-journal"):
        return True
    if rel.startswith("prisma/") and path.suffix in {".db", ".db-journal"}:
        return True
    if path.name.startswith("tmp-") and path.suffix in {".html", ".xml", ".txt"}:
        return True
    return False


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
            if should_skip_tar_path(path):
                continue
            if path.is_file():
                rel = path.relative_to(ROOT).as_posix()
                tar.add(path, arcname=rel)
    buf.seek(0)
    return buf.read()


def run(
    client: paramiko.SSHClient,
    cmd: str,
    check: bool = True,
    *,
    echo: str | None = None,
) -> str:
    print(f"$ {echo if echo is not None else cmd}")
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


ENV_PROTECT_KEYS = frozenset(
    {
        "AUTH_SECRET",
        "DATABASE_URL",
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "KABARDESK_SUPERADMIN_EMAIL",
        "KABARDESK_SUPERADMIN_PASSWORD",
    },
)


def parse_env_file(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for line in text.splitlines():
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("#"):
            continue
        if "=" not in trimmed:
            continue
        key, _, rest = trimmed.partition("=")
        key = key.strip()
        val = rest.strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in ('"', "'"):
            val = val[1:-1]
        out[key] = val
    return out


def render_env_file(values: dict[str, str]) -> str:
    order = [
        "DATABASE_URL",
        "AUTH_SECRET",
        "AUTH_URL",
        "NEXTAUTH_URL",
        "NEXT_PUBLIC_SITE_URL",
        "PORT",
        "HOSTNAME",
        "NODE_ENV",
        "KABARDESK_PRESERVE_DATA",
        "KABARDESK_DISABLE_DEMO_USERS",
        "AUTH_SECURE_COOKIES",
        "KABARDESK_SUPERADMIN_EMAIL",
        "KABARDESK_SUPERADMIN_PASSWORD",
        "OPENAI_API_KEY",
        "OPENAI_REWRITE_MODEL",
        "ANTHROPIC_API_KEY",
        "ANTHROPIC_REWRITE_MODEL",
    ]
    lines: list[str] = []
    seen: set[str] = set()
    for key in order:
        if key in values and values[key] != "":
            lines.append(f'{key}="{values[key].replace(chr(34), "")}"')
            seen.add(key)
    for key in sorted(values):
        if key in seen or values[key] == "":
            continue
        lines.append(f'{key}="{values[key].replace(chr(34), "")}"')
    return "\n".join(lines) + "\n"


def read_remote_env(sftp: paramiko.SFTPClient, remote_path: str) -> dict[str, str]:
    try:
        with sftp.file(remote_path, "r") as f:
            return parse_env_file(f.read().decode("utf-8", errors="replace"))
    except OSError:
        return {}


def write_remote_env(sftp: paramiko.SFTPClient, remote_path: str, content: str) -> None:
    with sftp.file(remote_path, "w") as f:
        f.write(content.encode("utf-8"))


def canonical_sqlite_url(remote_dir: str) -> str:
    return f"file:{remote_dir}/prisma/dev.db"


def normalize_database_url(existing: str | None, remote_dir: str) -> str:
    canonical = canonical_sqlite_url(remote_dir)
    if not existing or not existing.strip():
        return canonical
    url = existing.strip()
    if url.startswith("postgresql:"):
        return url
    if url in ("file:./dev.db", "file:./prisma/dev.db"):
        return canonical
    if url.startswith("file:./"):
        return canonical
    return url


def merge_env(
    existing: dict[str, str],
    defaults: dict[str, str],
    remote_dir: str,
) -> dict[str, str]:
    merged = dict(existing)
    for key, val in defaults.items():
        if key == "DATABASE_URL":
            merged[key] = normalize_database_url(existing.get("DATABASE_URL"), remote_dir)
            continue
        if key in ENV_PROTECT_KEYS and existing.get(key):
            continue
        merged[key] = val
    if "DATABASE_URL" not in merged or not merged["DATABASE_URL"]:
        merged["DATABASE_URL"] = canonical_sqlite_url(remote_dir)
    return merged


def install_vps_cron(client: paramiko.SSHClient, remote_dir: str) -> None:
    rss_line = (
        f"*/30 * * * * cd {remote_dir} && "
        f"flock -n /tmp/kabardesk-rss.lock npm run rss:poll "
        f">> /var/log/kabardesk-rss.log 2>&1"
    )
    backup_line = (
        f"15 3 * * * bash {remote_dir}/scripts/backup-db.sh "
        f">> /var/log/kabardesk-backup.log 2>&1"
    )
    run(
        client,
        "touch /var/log/kabardesk-rss.log /var/log/kabardesk-backup.log",
        check=False,
    )
    run(
        client,
        "(crontab -l 2>/dev/null | grep -v kabardesk-rss.lock | "
        "grep -v backup-db.sh; "
        f"echo '{rss_line}'; echo '{backup_line}') | crontab -",
        check=False,
    )


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
    auth_base = app_url if internal_port == PUBLIC_PORT else site_url
    db_path = f"{REMOTE_DIR}/prisma/dev.db"
    sqlite_url = canonical_sqlite_url(REMOTE_DIR)
    run(
        client,
        f"mkdir -p {REMOTE_DIR} && cd {REMOTE_DIR} && "
        f"test -f prisma/dev.db && cp prisma/dev.db /tmp/kabardesk-predeploy.db || true",
        check=False,
    )
    run(
        client,
        f"mkdir -p {REMOTE_DIR} && cd {REMOTE_DIR} && "
        f"rm -rf src .next && rm -f tmp-*.html tmp-*.xml && "
        f"tar xzf release.tgz && rm -f release.tgz && "
        f"rm -f prisma/dev.db prisma/**/*.db 2>/dev/null; "
        f"test -f /tmp/kabardesk-predeploy.db && "
        f"mv /tmp/kabardesk-predeploy.db prisma/dev.db || true",
        check=False,
    )

    sftp = client.open_sftp()
    existing_env = read_remote_env(sftp, f"{REMOTE_DIR}/.env")
    defaults: dict[str, str] = {
        "DATABASE_URL": sqlite_url,
        "AUTH_SECRET": auth_secret,
        "AUTH_URL": auth_base,
        "NEXTAUTH_URL": auth_base,
        "NEXT_PUBLIC_SITE_URL": site_url,
        "PORT": str(internal_port),
        "HOSTNAME": "0.0.0.0",
        "NODE_ENV": "production",
        "KABARDESK_PRESERVE_DATA": "1",
        "KABARDESK_DISABLE_DEMO_USERS": "1",
        "AUTH_SECURE_COOKIES": "false",
    }
    if super_email and super_password:
        defaults["KABARDESK_SUPERADMIN_EMAIL"] = super_email
        defaults["KABARDESK_SUPERADMIN_PASSWORD"] = super_password
    for key in (
        "OPENAI_API_KEY",
        "OPENAI_REWRITE_MODEL",
        "ANTHROPIC_API_KEY",
        "ANTHROPIC_REWRITE_MODEL",
    ):
        val = os.environ.get(key, "").strip()
        if val:
            defaults[key] = val
    merged = merge_env(existing_env, defaults, REMOTE_DIR)
    merged["PORT"] = str(internal_port)
    merged["AUTH_URL"] = auth_base
    merged["NEXTAUTH_URL"] = auth_base
    write_remote_env(sftp, f"{REMOTE_DIR}/.env", render_env_file(merged))
    sftp.close()
    print("Updated server .env (merged; secrets not logged)")
    run(client, f"cd {REMOTE_DIR} && npm install && npm run setup && npm run build")
    run(
        client,
        f"cd {REMOTE_DIR} && node scripts/sync-standalone-db.mjs",
        check=False,
    )
    run(
        client,
        f"cd {REMOTE_DIR} && pm2 delete {PM2_NAME} 2>/dev/null; PORT={internal_port} pm2 start npm --name {PM2_NAME} -- start && pm2 save",
        check=False,
    )
    run(client, "command -v pm2 >/dev/null && pm2 install pm2-logrotate 2>/dev/null || true", check=False)
    install_vps_cron(client, REMOTE_DIR)

    # Server uses Caddy on 80/443 — do not touch Caddyfile. App listens on {internal_port} only.
    run(
        client,
        f"curl -sI {site_url} | head -5",
        check=False,
    )

    time.sleep(3)
    run(client, f"curl -sI {site_url} | head -8", check=False)
    run(
        client,
        f"cd {REMOTE_DIR} && npx tsx scripts/fix-article-image-urls.ts",
        check=False,
    )
    if os.environ.get("KABARDESK_RUN_E2E", "").strip() == "1":
        run(
            client,
            f"cd {REMOTE_DIR} && node scripts/e2e-seed-article.mjs",
            check=False,
        )
    else:
        print("Skipping E2E seed on VPS (set KABARDESK_RUN_E2E=1 to enable)")
    e2e_email = super_email or os.environ.get("E2E_EMAIL", "").strip()
    e2e_password = super_password or os.environ.get("E2E_PASSWORD", "").strip()
    if not e2e_email or not e2e_password:
        e2e_email = "admin@kabardesk.id"
        e2e_password = "admin123"
    if os.environ.get("KABARDESK_RUN_E2E", "").strip() == "1":
        run(
            client,
            f"cd {REMOTE_DIR} && BASE_URL=http://127.0.0.1:{internal_port} "
            f"E2E_EMAIL={e2e_email} E2E_PASSWORD={e2e_password} node scripts/e2e_full.mjs",
            check=False,
            echo=(
                f"cd {REMOTE_DIR} && BASE_URL=http://127.0.0.1:{internal_port} "
                f"E2E_EMAIL={e2e_email} E2E_PASSWORD=*** node scripts/e2e_full.mjs"
            ),
        )
    else:
        run(
            client,
            f"cd {REMOTE_DIR} && BASE_URL=http://127.0.0.1:{internal_port} "
            f"node scripts/probe-health.mjs",
            check=False,
        )
    run(
        client,
        f"cd {REMOTE_DIR} && BASE_URL=http://127.0.0.1:{internal_port} node scripts/probe-health.mjs",
        check=False,
    )
    print("\nRunning live market ticker test on VPS…")
    run(
        client,
        f"cd {REMOTE_DIR} && npx tsx scripts/test-market-live.ts",
        check=False,
    )
    print("\nRunning live utilities test on VPS…")
    run(
        client,
        f"cd {REMOTE_DIR} && npx tsx scripts/test-utilities-live.ts",
        check=False,
    )
    if os.environ.get("OPENAI_API_KEY", "").strip():
        print("\nRunning live RSS poll + OpenAI rewrite test on VPS…")
        run(
            client,
            f"cd {REMOTE_DIR} && npx tsx scripts/test-rss-rewrite-live.ts",
            check=False,
        )
    client.close()
    print(f"\nDeployed (no conflict with port 80 sites): {site_url}")
    if super_email:
        print(f"Superadmin login: {super_email} (password in scripts/.superadmin-credentials)")
    elif merged.get("KABARDESK_DISABLE_DEMO_USERS") == "1":
        print("Demo logins disabled — use KABARDESK_SUPERADMIN_* in server .env")
    else:
        print("Admin: admin@kabardesk.id (change default password on production)")


if __name__ == "__main__":
    main()
