#!/usr/bin/env bash
# Backup KabarDesk database (SQLite file or PostgreSQL via pg_dump).
set -euo pipefail

APP_DIR="${KABARDESK_APP_DIR:-/var/www/kabardesk}"
BACKUP_DIR="${KABARDESK_BACKUP_DIR:-/var/backups/kabardesk}"
KEEP_DAYS="${KABARDESK_BACKUP_KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ -f "$APP_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  set -a
  source <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$APP_DIR/.env" | sed 's/\r$//')
  set +a
fi

DATABASE_URL="${DATABASE_URL:-}"

if [[ "$DATABASE_URL" == file:* ]]; then
  DB_PATH="${DATABASE_URL#file:}"
  if [[ ! -f "$DB_PATH" ]]; then
    echo "SQLite file not found: $DB_PATH" >&2
    exit 1
  fi
  OUT="$BACKUP_DIR/kabardesk-sqlite-$STAMP.db.gz"
  gzip -c "$DB_PATH" > "$OUT"
  echo "Wrote $OUT"
elif [[ "$DATABASE_URL" == postgresql:* ]]; then
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "pg_dump not installed" >&2
    exit 1
  fi
  OUT="$BACKUP_DIR/kabardesk-pg-$STAMP.sql.gz"
  pg_dump "$DATABASE_URL" | gzip > "$OUT"
  echo "Wrote $OUT"
else
  echo "Unsupported or missing DATABASE_URL" >&2
  exit 1
fi

find "$BACKUP_DIR" -type f -name 'kabardesk-*' -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true
