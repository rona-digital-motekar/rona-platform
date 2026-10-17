# Rona Platform · Starter 0.1

Fondasi awal untuk platform undangan digital Rona Digital Motekar.

## Yang sudah tersedia

- Halaman depan untuk membuka demo.
- Dua demo undangan dari **komponen/template yang sama** dengan data terpisah:
  - `/i/raka-alya`
  - `/i/andika-nadira`
- Gerakan adegan 2D, tombol navigasi, indikator langkah, dan swipe horizontal di HP.
- Schema awal Prisma + PostgreSQL untuk customer, template, undangan, domain, dan order.
- Dukungan `prefers-reduced-motion` agar gerakan bisa dikurangi sesuai pengaturan perangkat.

## Yang belum tersedia

- Belum ada database yang tersambung.
- Pilihan RSVP hanya demo lokal; belum terkirim ke server.
- Belum ada login, operator dashboard, pembayaran, unggah foto, atau domain customer.
- Data tanggal dan lokasi pada undangan adalah **contoh**, bukan acara nyata.

## Cara menjalankan di GitHub Codespaces

1. Buka repository `rona-platform` di GitHub.
2. Ketuk **Code → Codespaces → Create codespace on main**. Kalau ada pilihan branch, pakai branch kerja khusus agar perubahan tidak masuk ke branch utama sebelum diperiksa.
3. Di Codespaces, buka Terminal → New Terminal.
4. Unggah ZIP starter ini ke folder proyek melalui panel Explorer (ikon file), lalu jalankan perintah di bawah. Nama ZIP yang diunduh mungkin persis seperti file yang kamu simpan, jadi sesuaikan namanya pada perintah `unzip`.

```bash
unzip rona-platform-starter.zip -d /tmp/rona-upload
cp -a /tmp/rona-upload/rona-platform-starter/. .
rm rona-platform-starter.zip
npm install
npm run dev
```

Jika nama file berbeda, ganti `rona-platform-starter.zip` sesuai nama file di Codespaces.

5. Codespaces biasanya mendeteksi port `3000`. Buka port itu lewat tab **Ports** → **Open in Browser**.
6. Coba halaman utama, kemudian buka kedua demo undangan dari kartu di halaman tersebut. Uji tombol dan swipe kiri/kanan.

## Menyimpan perubahan ke GitHub

Setelah halaman berhasil dibuka, jalankan di terminal:

```bash
git status
git add .
git commit -m "Add Rona Platform starter"
git push
```

Jangan masukkan file `.env` ke GitHub. File tersebut untuk rahasia seperti URL database; `.env.example` aman disimpan di repo karena hanya berisi contoh.

## Database (belum perlu sekarang)

Schema tersedia di `prisma/schema.prisma`, tetapi prototype halaman tidak membutuhkan database. Saat database PostgreSQL sudah dibuat:

1. Salin `.env.example` menjadi `.env`.
2. Isi `DATABASE_URL` dengan connection string database sendiri.
3. Jalankan `npm run db:generate`, lalu `npm run db:push`.

Jangan jalankan perintah database sebelum `DATABASE_URL` diisi dengan database yang benar. Jangan pernah membagikan connection string atau password database.

## Folder penting

```text
src/app/                 Halaman Next.js dan gaya visual
src/app/i/[slug]/        Route setiap undangan
src/components/          Komponen undangan yang reusable
src/lib/invitations.ts   Data demo undangan
prisma/schema.prisma     Rancangan database PostgreSQL
.env.example             Contoh variabel environment
```
