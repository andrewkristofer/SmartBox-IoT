# 📦 Smart Box IoT - Backend Service

> **Status:** 🚧 Work in Progress (WIP)

---

## 📖 Daftar Isi
- [Tech Stack](#-tech-stack)
- [Instalasi & Menjalankan](#-instalasi--menjalankan-server)
- [Simulasi Perangkat](#-simulasi-perangkat-mqtt)


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
```
### 2. Jalankan Server Utama
Setelah instalasi selesai, jalankan server dengan perintah:

```bash
py .\backend.py
```
Server akan aktif dan siap menerima data

---

## 📡 Simulasi Perangkat (MQTT)
Apabila Anda ingin mensimulasikan perangkat data Smart Box (tanpa hardware fisik), Anda dapat menjalankan skrip mqtt_simulator.py. Skrip ini akan mengirimkan data dummy (suhu, kelembaban, dan lokasi) ke backend.

Cara menjalankannya: Buka terminal baru (jangan matikan terminal server backend), lalu jalankan:

```bash
cd .\backend\
py .\mqtt_simulator.py
```




