import time
import json
import random
import paho.mqtt.client as mqtt

# Konfigurasi (Samakan dengan backend.py)
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "smartbox/kelompok11/data"

# Daftar ID Box yang ingin disimulasikan (Sesuai dengan FLEET_IDS di DashboardPage.jsx)
BOX_IDS = ["SMARTBOX-001", "SMARTBOX-002", "SMARTBOX-003"]

def connect_mqtt():
    client = mqtt.Client(client_id=f"simulator-{random.randint(0, 1000)}")
    client.connect(MQTT_BROKER, MQTT_PORT)
    return client

def publish(client):
    while True:
        for box_id in BOX_IDS:
            # Generate data dummy yang masuk akal
            temp = round(random.uniform(2.0, 5.0), 2) # Suhu kulkas (kadang naik dikit biar merah)
            hum = round(random.uniform(45.0, 65.0), 2)
            
            # Koordinat dummy (sekitar Jakarta/Depok)
            lat = -6.36 + random.uniform(-0.01, 0.01)
            lon = 106.82 + random.uniform(-0.01, 0.01)

            payload = {
                "box_id": box_id,
                "temperature": temp,
                "humidity": hum,
                "latitude": lat,
                "longitude": lon
            }
            
            payload_json = json.dumps(payload)
            result = client.publish(MQTT_TOPIC, payload_json)
            
            status = result[0]
            if status == 0:
                print(f"Sent {box_id}: {payload_json}")
            else:
                print(f"Failed to send {box_id}")
        
        # Kirim data setiap 5 detik
        time.sleep(5)

if __name__ == '__main__':
    client = connect_mqtt()
    client.loop_start()
    publish(client)