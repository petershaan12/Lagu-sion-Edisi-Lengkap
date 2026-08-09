# Lagu Sion Edisi Lengkap

![Lagu Sion Edisi Lengkap](public/thumbnail.png)

Katalog lirik dan chord Lagu Sion Edisi Lengkap berbasis Next.js dan MongoDB, dengan admin privat dan mode display satu bait per slide.

## Menjalankan lokal

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buka `http://localhost:3000`. Area admin tersedia di `/admin`.

## Konfigurasi

- `MONGODB_URI`: koneksi MongoDB Atlas atau MongoDB lokal.
- `MONGODB_DB`: nama database, default `lagusion`.
- `ADMIN_PASSWORD`: password admin tunggal.
- `AUTH_SECRET`: secret panjang dan acak untuk menandatangani sesi.
- `NEXT_PUBLIC_SITE_URL`: domain production untuk canonical URL dan sitemap.
- `NEXT_PUBLIC_GA_ID`: ID Google Analytics 4 (`G-XXXXXXXXXX`). Kosongkan untuk mematikan tracking.
- `ADMIN_GATE`: string acak, path login admin jadi `/masuk/<ADMIN_GATE>`.

Tanpa `MONGODB_URI`, aplikasi menampilkan tiga lagu demo dalam mode baca-saja. Lirik dipisahkan menjadi slide berdasarkan baris kosong.

## Pemeriksaan

```bash
npm test
npm run lint
npm run build
```
