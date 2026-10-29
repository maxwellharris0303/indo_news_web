# Deploy KabarDesk ke VPS (23.88.20.96)

## Status akses SSH

Dari mesin build, login **`root@23.88.20.96:22` dengan password yang diberikan ditolak** (`Authentication failed`). Port 22 terbuka, metode `password` dan `publickey` diizinkan.

Tanpa SSH yang valid, deploy otomatis tidak bisa diselesaikan. Pilih salah satu:

### Opsi A — Reset password root (panel provider)

1. Reset password root di panel VPS (Hetzner, Contabo, dll.).
2. Simpan password baru di `scripts/.deploy-secret` (satu baris, tanpa spasi).
3. Jalankan:

```bash
python scripts/deploy_vps.py
```

### Opsi B — SSH key (disarankan)

Di **console VPS** (VNC/serial), sebagai root:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICCHgctsBPs9LxyNBTSFCx5AFhhY7ee2JWE125judcu8 administrator@DESKTOP-GMGJQ2V' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Lalu dari repo:

```bash
python scripts/deploy_vps.py
```

Script memakai `scripts/deploy_ed25519` jika ada, lalu fallback ke password di `.deploy-secret`.

## Setelah deploy

- Situs: **http://23.88.20.96:3010** (port terpisah; Caddy tetap di 80/443 untuk situs lain)
- Admin: `admin@kabardesk.id` / `admin123` → `/admin`
- Pembaca demo: `pembaca@kabardesk.id` / `reader123`

**Keamanan:** ganti password demo dan `AUTH_SECRET` di `/var/www/kabardesk/.env` setelah go-live. Rotasi password root VPS karena pernah dibagikan di chat.

## Uji lokal

```bash
npm run build
PORT=3001 npm run start
node scripts/e2e_smoke.mjs
```
