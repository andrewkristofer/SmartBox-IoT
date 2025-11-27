# 📦 Smart Box IoT - Backend Service

> **Status:** 🚧 Work in Progress (WIP)

**Smart Box IoT** adalah Sistem Penyimpanan dan Transportasi Pintar berbasis IoT untuk mendukung program distribusi pangan yang efisien dan transparan. Backend ini bertugas menerima data sensor, memproses logika notifikasi, dan menyediakan API untuk dashboard.

Proyek ini dikembangkan oleh **Kelompok 11, Fakultas Teknik, Universitas Indonesia**.

---

## 📖 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Struktur Proyek](#-struktur-proyek)
- [Tech Stack](#-tech-stack)
- [Instalasi & Menjalankan](#-instalasi--menjalankan-server)
- [Simulasi Perangkat](#-simulasi-perangkat-mqtt)
- [Kontak & Kredit](#-kontak--kredit)

---

## ✨ Fitur Utama

* **Pemantauan Real-time:** Monitoring suhu, kelembaban, dan lokasi GPS dari perangkat box.
* **Notifikasi Otomatis:** Peringatan instan jika kondisi di dalam box keluar dari batas optimal (misalnya suhu terlalu tinggi).
* **Dashboard & Analitik:** Menyediakan endpoint API untuk visualisasi data bagi pemangku kepentingan.

---

## 📂 Struktur Proyek

Proyek ini dibagi menjadi dua komponen utama:

1.  **/firmware:** Kode C++/Arduino yang berjalan pada mikrokontroler ESP32 di dalam Smart Box. *(Lihat instruksi khusus di folder firmware)*.
2.  **/backend:** Server Python (Flask) yang menerima data dari perangkat dan menyediakan API. **(Dokumentasi ini fokus pada bagian backend)**.

---

## 🛠️ Tech Stack

* **Bahasa:** Python
* **Framework:** Flask
* **Protokol:** MQTT (untuk komunikasi data IoT)

---

## 🚀 Instalasi & Menjalankan Server

Pastikan Python sudah terinstal di komputer Anda. Ikuti langkah berikut untuk menjalankan server backend:

### 1. Masuk ke Direktori & Install Dependencies
Buka terminal/command prompt, lalu jalankan perintah berikut:

```bash
cd .\backend\
python -m pip install -r .\requirements.txt

### 2. Jalankan Server Utama
Setelah instalasi selesai, jalankan server dengan perintah:

```bash
py .\backend.py
Server akan aktif dan siap menerima data
