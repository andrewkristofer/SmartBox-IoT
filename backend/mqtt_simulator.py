import paho.mqtt.client as mqtt
import time
import random
import json
import sys

# ================= KONFIGURASI =================
BROKER = "broker.hivemq.com"
PORT = 1883
TOPIC = "smartbox/kelompok11/data"

# ================= LOGIKA SIMULATOR =================

def generate_sensor_data(box_index, base_lat=-6.362480, base_lon=106.824050):
    """
    Membuat data dummy yang sedikit random agar terlihat realistis.
    Setiap box punya lokasi dasar yang sedikit berbeda.
    """
    box_id = f"SMARTBOX-{box_index:03d}" # Contoh: SMARTBOX-001
    
    # Random suhu (2.0 - 5.0 C)
    temp = round(random.uniform(2.0, 5.0), 2)
    
    # Random kelembapan (45 - 65 %)
    hum = round(random.uniform(45.0, 65.0), 2)
    
    # Random pergeseran lokasi (biar kelihatan bergerak dikit)
    lat_shift = random.uniform(-0.0005, 0.0005)
    lon_shift = random.uniform(-0.0005, 0.0005)
    
    # Lokasi tiap box digeser sedikit biar tidak numpuk di satu titik
    offset_index = box_index * 0.002 
    
    return {
        "box_id": box_id,
        "temperature": temp,
        "humidity": hum,
        "latitude": base_lat + offset_index + lat_shift,
        "longitude": base_lon + offset_index + lon_shift
    }

def main():
    print("========================================")
    print("   SMARTBOX IOT - FLEET SIMULATOR")
    print("========================================")
    
    # 1. INPUT DINAMIS DARI USER
    try:
        num_boxes = int(input("Masukkan jumlah box yang ingin disimulasikan (1-100): "))
        if num_boxes < 1: num_boxes = 1
    except ValueError:
        print("Input tidak valid, default ke 3 box.")
        num_boxes = 3

    print(f"\n[INFO] Memulai simulasi untuk {num_boxes} armada...")
    print(f"[INFO] Connecting to Broker: {BROKER}...")

    client = mqtt.Client(client_id=f"sim-publisher-{random.randint(1000,9999)}")
    
    try:
        client.connect(BROKER, PORT, 60)
        print("[SUCCESS] Terhubung ke MQTT Broker!\n")
    except Exception as e:
        print(f"[ERROR] Gagal koneksi: {e}")
        sys.exit(1)

    try:
        while True:
            # Loop untuk setiap box yang diminta user
            for i in range(1, num_boxes + 1):
                data = generate_sensor_data(i)
                payload = json.dumps(data)
                
                client.publish(TOPIC, payload)
                print(f"📡 {data['box_id']} -> Temp: {data['temperature']}°C | Hum: {data['humidity']}%")
                
                # Jeda dikit antar pengiriman paket biar ga spamming server banget
                time.sleep(0.2) 
            
            print("-" * 40)
            # Jeda global sebelum update data berikutnya (misal tiap 5 detik)
            time.sleep(5) 

    except KeyboardInterrupt:
        print("\n[STOP] Simulasi dihentikan.")
        client.disconnect()

if __name__ == "__main__":
    main()