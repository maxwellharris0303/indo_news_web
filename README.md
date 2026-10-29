# KabarDesk

Portal berita Indonesia — **Berita Terkini, Terpercaya, Dekat Kamu**.

## Fitur

- Beranda editorial (hero, terkini, terpopuler, topik, daerah, cek fakta)
- Artikel dengan **Baca cepat**, **Dengarkan** (TTS browser), trust box, SEO JSON-LD
- **Cek fakta**, liputan **daerah**, hub **topik**
- **Auth** (NextAuth): simpan artikel, atur minat, rekomendasi "Untuk kamu"
- **Admin CMS** (`/admin`): publikasi artikel cepat (ADMIN/EDITOR)
- **SQLite + Prisma** (siap diganti PostgreSQL via `DATABASE_URL`)
- **Ticker pasar live:** USD/IDR & IHSG (Yahoo Finance), emas spot IDR/gr (COMEX + kurs), cuaca Jakarta (Open-Meteo); cache 5 menit, tanpa angka demo
- **Utilitas Jakarta:** jadwal sholat (Aladhan · metode Kemenag) + kualitas udara US AQI/PM2.5 (Open-Meteo); cache 30 menit

## Brand

- **Nama:** KabarDesk
- **Warna utama:** `#1D4ED8`

## Setup

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Akun demo

| Peran | Email | Password |
|-------|-------|----------|
| Admin | admin@kabardesk.id | admin123 |
| Pembaca | pembaca@kabardesk.id | reader123 |

## Scripts

| Command | Kegunaan |
|---------|----------|
| `npm run dev` | Development |
| `npm run setup` | `db push` + seed |
| `npm run build` | Generate DB, seed, production build |
| `npm run db:seed` | Isi ulang data demo |

## PostgreSQL (production)

Ubah `DATABASE_URL` di `.env`, misalnya:

`DATABASE_URL="postgresql://user:pass@localhost:5432/kabardesk"`

Lalu `npm run setup`.

## Struktur

- `src/lib/content/` — tipe, seed fallback, repository Prisma
- `src/app/admin` — panel redaksi
- `prisma/schema.prisma` — model artikel, fakta, user
