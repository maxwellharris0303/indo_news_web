#!/usr/bin/env bash
set -euo pipefail
APP=/var/www/kabardesk
CANON='DATABASE_URL="file:/var/www/kabardesk/prisma/dev.db"'
ENV="$APP/.env"
if grep -q 'DATABASE_URL="file:./dev.db"' "$ENV" 2>/dev/null; then
  sed -i 's|DATABASE_URL="file:./dev.db"|DATABASE_URL="file:/var/www/kabardesk/prisma/dev.db"|' "$ENV"
fi
mkdir -p "$APP/.next/standalone/prisma"
cp "$APP/prisma/dev.db" "$APP/.next/standalone/prisma/dev.db"
cp "$APP/.env" "$APP/.next/standalone/.env"
echo "DB synced; DATABASE_URL=$(grep ^DATABASE_URL= "$ENV" | head -1)"
pm2 restart kabardesk
