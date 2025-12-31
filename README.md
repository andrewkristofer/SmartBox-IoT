# Smart Box IoT

Sistem Penyimpanan dan Monitoring Pintar berbasis IoT untuk mendukung program distribusi pangan yang efisien dan transparan. Proyek ini dikembangkan oleh Kelompok 11, Fakultas Teknik, Universitas Indonesia.

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
  
  Landing Page ini berisi penjelasan tentang apa itu Smart Box IoT, mengapa Smart Box IoT diperlukan, dan bagaimana Smart Box IoT dapat meningkatkan kualitas distribusi dan penyimpanan pangan
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/a8834ae6-d3e0-4652-8a77-30624d16bc86" />
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/07d56161-49eb-4fd2-ae17-57aa0a1f2a54" />
  <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/096c9b2d-fb4d-4dbb-bd2c-6e5843b2f4fe" />
- **Registrasi untuk Akun Dashboard Admin**
  
  Pertama, tekan tombol login yang berada di bagian kanan atas Landing Page
  <img width="1899" height="886" alt="image" src="https://github.com/user-attachments/assets/879a7a9c-46b9-47b4-b28d-70002b9b44ad" />
  
  Lalu tekan tombol "Daftar di sini" yang berada di bawah tombol "Masuk" 
  <img width="1919" height="886" alt="image" src="https://github.com/user-attachments/assets/7e2d7508-783e-4c24-84d3-27c5e6ad9368" />
  
  Selanjutnya isi data yang diminta untuk registrasi akun admin, setelah mengisi data dengan lengkap dan sesuai, tekan tombol "Daftar"
  <img width="1899" height="896" alt="image" src="https://github.com/user-attachments/assets/0bc2f794-bfe9-424e-85e9-690556cca69f" />
  Tunggu sampai akun anda disetujui dan diaktifkan oleh Super Admin, setelah akun anda aktif, anda bisa langsung login ke Dashboard Admin
- **Login ke Dashboard Admin**
  
  Jika akun sudah aktif, anda bisa langsung Login ke Dashboard Admin dengan menekan tombol Login di Landing Page, lalu isi Nama Pengguna dan Sandi dengan yang sudah anda buat sebelumnya
  <img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/ca83d97f-9741-4be4-9aae-ba1ef09f230a" />
  Selanjutnya, tekan tombol "Masuk" untuk menggunakan Dashboard Admin
- **Dashboard Admin**

  Di sini, anda sebagai admin dapat memonitor kondisi box-box penyimpanan (suhu dan kelembapan di dalam box) anda secara realtime 24/7

  Pada page Satus Armada Langsung ini, anda bisa melihat status semua box, status yang bisa dilihat antara lain adalah Suhu, Kelembapan, dan Koordinat lokasi terakhir box secara realtime.
  <img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/4834df50-d3d7-406b-a1c9-85f8d3898ddb" />
  
  Dashboard juga akan memberikan notifikasi jika ada box yang kondisinya keluar dari threshold yang sudah ditetapkan
  <img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/9aad9d1e-2cc9-440d-8ed7-5ac3e430eb96" />
  
  Anda bisa melihat grafik riwayat kondisi masing-masing box dengan menekan ID Boxnya 
  <img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/1f62abf5-0dbd-4979-91f9-9119f583d839" />
  
  Anda juga bisa mengunduh riwayat kondisi masing-masing box dalam format Excel dengan menekan tombol "Export CSV" di kanan atas halaman detail masing-masing box
  <img width="1900" height="910" alt="image" src="https://github.com/user-attachments/assets/04fae554-08bc-477c-9b0f-2d54cb86a3b6" />
  
  Berikut adalah hasil Export riwayat kondisi salah satu box yang dimonitor di Dashboard Smart Box IoT
  <img width="1919" height="1018" alt="image" src="https://github.com/user-attachments/assets/c0d0381c-4dd4-49b1-888c-c739d2531404" />

Smart Box IoT juga memiliki sistem peringatan pada hardwarenya. Dengan menggunakan LED dan Buzzer, ketika kondisi box keluar dari threshold LED akan berubah dari Hijau menjadi Merah, dan jika kondisi box tidak kembali kedalam threshold selama dua menit, buzzer akan menyala selama satu menit untuk memperingatkan petugas yang berada di sekitar box dan juga memudahkan identifikasi box mana yang keluar dari threshold 
- **Lampu indikator Hijau menyala, menandakan sistem berjalan normal. Buzzer dalam keadaan mati"
  <img width="1024" height="863" alt="image" src="https://github.com/user-attachments/assets/701f873e-80d1-47a4-af07-aedde59273ef" />
- **Sistem segera mematikan LED Hijau dan menyalakan lampu LED Merah. Buzzer aktif sesuai dengan pola peringatan (menyala satu menit setelah keluar dari threshold 2 menit) untuk memberikan peringatan audio kepada petugas**
  <img width="976" height="850" alt="image" src="https://github.com/user-attachments/assets/b8188fef-a7be-47aa-b364-9b36dd4d11fe" />

Proyek Smart Box IoT ini masih terus dikembangkan dan terbuka untuk penyempurnaan ke depannya. Semoga dokumentasi ini bisa membantu memahami alur sistem, fitur, dan cara penggunaan dashboard. Kalau nemu bug, punya saran, atau ide pengembangan baru, feel free buat eksplor dan diskusi. Terima kasih sudah mampir dan mencoba Smart Box IoT 🙌


