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
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/07d56161-49eb-4fd2-ae17-57aa0a1f2a54" />
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/096c9b2d-fb4d-4dbb-bd2c-6e5843b2f4fe" />
- **Registrasi untuk Akun Admin Dashboard**
  
  Pertama, tekan tombol login yang berada di bagian kanan atas Landing Page
  <img width="1899" height="886" alt="image" src="https://github.com/user-attachments/assets/879a7a9c-46b9-47b4-b28d-70002b9b44ad" />
  Lalu tekan tombol "Daftar di sini" yang berada di bawah tombol "Masuk" 
  <img width="1919" height="886" alt="image" src="https://github.com/user-attachments/assets/7e2d7508-783e-4c24-84d3-27c5e6ad9368" />
  Selanjutnya isi data yang diminta untuk registrasi akun admin, setelah sudah mengisi data dengan lengkap dan sesuai, tekan tombol "Daftar"
  <img width="1899" height="896" alt="image" src="https://github.com/user-attachments/assets/0bc2f794-bfe9-424e-85e9-690556cca69f" />
  Tunggu sampai akun anda di_Approve_ dan diaktifkan oleh Super Admin, setelah akun anda aktif, anda bisa langsung login ke Dashboard Admin
- **Login ke Admin Dashboard**
  
  Jika akun sudah aktif, anda bisa langsung Login ke Admin Dashboard dengan menekan tombol Login di Landing Page lalu isi Nama Pengguna dan Sandi dengan yang sudah anda buat sebelumnya
  <img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/ca83d97f-9741-4be4-9aae-ba1ef09f230a" />
  Lalu tekan tombol "Masuk" untuk masuk ke Admin Dashboard
- **
