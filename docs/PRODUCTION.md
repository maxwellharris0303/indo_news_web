# Production (tanpa domain kustom)

Panduan menjalankan KabarDesk di VPS **sebelum** domain dan HTTPS siap. Setelah domain aktif, tambahkan reverse proxy, `NEXT_PUBLIC_SITE_URL` HTTPS, dan `AUTH_SECURE_COOKIES=true`.

## Checklist

| Area | Status |
|------|--------|
| App di PM2, port dedicated (mis. 3010) | Deploy script |
| Data produksi tidak di-wipe saat deploy | `KABARDESK_PRESERVE_DATA=1` + seed production |
| Akun demo dinonaktifkan | `KABARDESK_DISABLE_DEMO_USERS=1` |
| Superadmin dari env / file lokal | `scripts/.superadmin-credentials` |
| RSS poll otomatis | cron VPS (di-install deploy) |
| Backup DB harian | cron + `scripts/backup-db.sh` |
| Health check | `GET /api/health` |
| CI GitHub | `.github/workflows/ci.yml` |
| PostgreSQL (opsional) | `docker-compose.postgres.yml` |

## Environment (`.env` di server)

File **hanya di server** — deploy tidak menimpa secret yang sudah ada (`AUTH_SECRET`, `DATABASE_URL`, API keys).

```bash
DATABASE_URL="file:/var/www/kabardesk/prisma/dev.db"
# atau PostgreSQL:
# DATABASE_URL="postgresql://kabardesk:PASSWORD@127.0.0.1:5432/kabardesk"

AUTH_SECRET="…"
AUTH_URL="http://23.88.20.96:3010"
NEXTAUTH_URL="http://23.88.20.96:3010"
NEXT_PUBLIC_SITE_URL="http://23.88.20.96:3010"
PORT=3010
HOSTNAME=0.0.0.0
NODE_ENV=production
KABARDESK_PRESERVE_DATA=1
KABARDESK_DISABLE_DEMO_USERS=1
AUTH_SECURE_COOKIES=false

KABARDESK_SUPERADMIN_EMAIL="you@example.com"
KABARDESK_SUPERADMIN_PASSWORD="…"

OPENAI_API_KEY=""
OPENAI_REWRITE_MODEL="gpt-4o-mini"

# Optional: Kompas rss.kompas.com API (lebih andal daripada Google News saja)
KOMPAS_RSS_API_KEY=""
```

Opsional lokal untuk deploy (gitignored):

- `scripts/.auth-secret` — dipakai hanya jika server belum punya `AUTH_SECRET`
- `scripts/.superadmin-credentials` — baris 1: email, baris 2: password
- `scripts/.deploy-secret` — SSH password jika tidak pakai key

Variabel tambahan:

| Variable | Kegunaan |
|----------|----------|
| `KABARDESK_SEED_DEMO_COMMENTS=1` | Isi ulang komentar demo (default off di production) |
| `KABARDESK_BACKUP_DIR` | Folder backup (default `/var/backups/kabardesk`) |

## PostgreSQL

Di VPS (localhost only):

```bash
cd /var/www/kabardesk
export POSTGRES_PASSWORD='…'
docker compose -f docker-compose.postgres.yml up -d
```

Ubah `DATABASE_URL` di `.env`, lalu:

```bash
npm run setup
pm2 restart kabardesk
```

Migrasi dari SQLite: export/import manual atau dump — rencanakan maintenance window.

## RSS cron

Deploy memasang entri crontab (poll ~30 menit):

```cron
*/30 * * * * cd /var/www/kabardesk && flock -n /tmp/kabardesk-rss.lock npm run rss:poll >> /var/log/kabardesk-rss.log 2>&1
```

Log: `/var/log/kabardesk-rss.log`

## Backup

Manual:

```bash
bash /var/www/kabardesk/scripts/backup-db.sh
```

Deploy juga memasang backup harian (03:15 UTC) jika belum ada.

## Monitoring

```bash
BASE_URL=http://127.0.0.1:3010 npm run probe:health
```

Gunakan URL publik atau cron eksternal (UptimeRobot, dll.) ke `/api/health`.

## Deploy

Dari mesin dev (SSH + secrets lokal):

```bash
npm run deploy:vps
```

Deploy: upload tarball, **merge** `.env` (tanpa log isi secret), `npm install`, `setup`, `build`, PM2, cron RSS + backup, smoke tests.

## Nanti (saat domain siap)

- Reverse proxy (Caddy/nginx) → app bind `127.0.0.1` jika perlu
- `NEXT_PUBLIC_SITE_URL` / `AUTH_URL` HTTPS
- `AUTH_SECURE_COOKIES=true`
- Google Search Console + submit sitemap
