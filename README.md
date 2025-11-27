# Smart Box IoT (Work in Progress)

Sistem Penyimpanan dan Transportasi Pintar berbasis IoT untuk mendukung program distribusi pangan yang efisien dan transparan. Proyek ini dikembangkan oleh Kelompok 11, Fakultas Teknik, Universitas Indonesia.

## Fitur Utama

- **Pemantauan Real-time**: Monitoring suhu, kelembaban, dan lokasi GPS.
- **Notifikasi Otomatis**: Peringatan instan jika kondisi di dalam box keluar dari batas optimal.
- **Dashboard & Analitik**: Visualisasi data untuk pemangku kepentingan.

## Struktur Proyek

Proyek ini dibagi menjadi dua komponen utama:

- **`/firmware`**: Kode C++/Arduino yang berjalan pada mikrokontroler ESP32 di dalam Smart Box.
  - **[Lihat Instruksi Firmware](./firmware/smartbox_firmware/README.md)**
- **`/backend`**: Server Python (Flask) yang menerima data dari perangkat dan menyediakan API.
  - **[Lihat Instruksi Backend](./backend/README.md)**

## Dokumentasi

Dokumentasi persyaratan proyek yang lebih detail dapat ditemukan di folder `/docs`.