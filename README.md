# Smart Box IoT (Work in Progress)

Sistem Penyimpanan dan Transportasi Pintar berbasis IoT untuk mendukung program distribusi pangan yang efisien dan transparan. Proyek ini dikembangkan oleh Kelompok 11, Fakultas Teknik, Universitas Indonesia.

## Fitur Utama

- **Pemantauan Real-time**: Monitoring suhu, kelembaban, dan lokasi GPS.
- **Notifikasi Otomatis**: Peringatan instan jika kondisi di dalam box keluar dari batas optimal.
- **Dashboard & Analitik**: Visualisasi data untuk pemangku kepentingan.

## Struktur Proyek

Proyek ini dibagi menjadi tiga komponen utama:

- **`/firmware`**: Kode C++/Arduino yang berjalan pada mikrokontroler ESP32 di dalam Smart Box.
  - **[Lihat Instruksi Firmware](./firmware/smartbox_firmware/README.md)**
- **`/backend`**: Server Python (Flask) yang menerima data dari perangkat dan menyediakan API.
  - **[Lihat Instruksi Backend](./backend/README.md)**
- **`/frontend`**: _User Interface_ yang menampilkan status dari Smart Box sekaligus analitik.
  - **[Lihat Instruksi Frontend](./frontend/README.md)**


## Dokumentasi

Dokumentasi ini sekaligus menjadi panduan untuk menggunakan Dashboard Smart Box IoT
- **Landing Page**
  Landing Page ini berisi penjelasan tentang apa itu Smart Box IoT, mengapa kita perlu Smart Box IoT, dan bagaimana Smart Box IoT dapat meningkatkan kualitas distribusi dan penyimpanan pangan
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/a8834ae6-d3e0-4652-8a77-30624d16bc86" />
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/af96ef76-0c1c-40a4-a4e6-0ddaf71f6716" />
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/096c9b2d-fb4d-4dbb-bd2c-6e5843b2f4fe" />
- **Sign-Up untuk Admin Dashboard**
- **Sign-in ke Admin Dashboard**
- **
