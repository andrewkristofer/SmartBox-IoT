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

# Dictionary untuk menyimpan posisi terakhir setiap armada
# Agar pergerakan terlihat realistis (tidak teleport)
fleet_memory = {} 

def get_next_position(box_index):
    """
    Menghasilkan koordinat yang tersebar di area JABODETABEK.
    Jika box baru, beri posisi acak.
    Jika box lama, geser sedikit dari posisi terakhir (simulasi jalan).
    """
    
    # Batas Koordinat Kasar Jabodetabek
    # Utara (Ancol) ~ -6.1, Selatan (Bogor) ~ -6.6
    # Barat (Tangerang) ~ 106.5, Timur (Bekasi) ~ 107.1
    lat_min, lat_max = -6.65, -6.10
    lon_min, lon_max = 106.50, 107.15

    # Jika box ini belum punya posisi (awal simulasi)
    if box_index not in fleet_memory:
        start_lat = random.uniform(lat_min, lat_max)
        start_lon = random.uniform(lon_min, lon_max)
        fleet_memory[box_index] = {'lat': start_lat, 'lon': start_lon}
    
    # Ambil posisi terakhir
    current_pos = fleet_memory[box_index]
    
    # Simulasi pergerakan kendaraan (bergeser sekitar 10-100 meter)
    # Arah acak (-0.0005 s/d 0.0005 derajat)
    move_lat = random.uniform(-0.0005, 0.0005)
    move_lon = random.uniform(-0.0005, 0.0005)
    
    # Update posisi di memori
    new_lat = current_pos['lat'] + move_lat
    new_lon = current_pos['lon'] + move_lon
    
    # Jaga agar tidak keluar batas peta (pantulkan balik jika keluar)
    if new_lat < lat_min or new_lat > lat_max: move_lat *= -1
    if new_lon < lon_min or new_lon > lon_max: move_lon *= -1
    
    fleet_memory[box_index]['lat'] = new_lat
    fleet_memory[box_index]['lon'] = new_lon
    
    return new_lat, new_lon

def generate_sensor_data(box_index):
    box_id = f"SMARTBOX-{box_index:03d}"
    
    # Random suhu (2.0 - 9.0 C) - Biar ada yang kadang "Danger"
    temp = round(random.uniform(2.0, 9.0), 2)
    
    # Random kelembapan (45 - 65 %)
    hum = round(random.uniform(45.0, 65.0), 2)
    
    # Dapatkan koordinat dinamis Jabodetabek
    lat, lon = get_next_position(box_index)
    
    return {
        "box_id": box_id,
        "temperature": temp,
        "humidity": hum,
        "latitude": lat,
        "longitude": lon
    }

def main():
    print("========================================")
    print("   SMARTBOX IOT - JABODETABEK FLEET")
    print("========================================")
    
    # 1. INPUT DINAMIS DARI USER
    try:
        num_boxes = int(input("Masukkan jumlah box simulasi (1-100): "))
        if num_boxes < 1: num_boxes = 1
    except ValueError:
        print("Input tidak valid, default ke 5 box.")
        num_boxes = 5

    print(f"\n[INFO] Menyebar {num_boxes} armada ke area Jabodetabek...")
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
                
                # Print status singkat agar terminal rapi
                loc_info = f"Lat: {data['latitude']:.4f}, Lon: {data['longitude']:.4f}"
                print(f"🚚 {data['box_id']} | 🌡️ {data['temperature']}°C | 📍 {loc_info}")
                
                time.sleep(0.1) # Kirim cepat
            
            print("-" * 50)
            print("⏳ Menunggu update lokasi berikutnya (5 detik)...")
            time.sleep(5) 

    except KeyboardInterrupt:
        print("\n[STOP] Simulasi dihentikan.")
        client.disconnect()

if __name__ == "__main__":
    main()