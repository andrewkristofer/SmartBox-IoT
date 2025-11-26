"""
Backend server for the Smart Box IoT project.
Author: Kelompok 11 - Universitas Indonesia
Version: 1.3 (Full SQLite Migration)
"""

import sqlite3
import json
import time
import os
import jwt 
import datetime 
from threading import Thread
from dotenv import load_dotenv 
import paho.mqtt.client as mqtt
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# ==============================================================================
# SECTION 2: KONFIGURASI
# ==============================================================================

script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# --- Ambil Konfigurasi ---
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "smartbox/kelompok11/data")
API_PORT = int(os.getenv("API_PORT", 5000))
DB_FILE_NAME = os.getenv("DB_FILE", "smartbox_data.db")
DB_FILE = os.path.join(script_dir, DB_FILE_NAME)
JWT_SECRET = os.getenv("JWT_SECRET", "rahasia_default_kalau_env_hilang") 

# ==============================================================================
# SECTION 3: DATABASE MANAGEMENT (FULL SQLITE)
# ==============================================================================

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row 
    return conn

def initialize_database():
    """Membuat tabel data sensor DAN tabel users."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Tabel Sensor Data
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS smartbox_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            box_id TEXT NOT NULL,
            temperature REAL,
            humidity REAL,
            latitude REAL,
            longitude REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Tabel Users (Pengganti MongoDB)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        conn.commit()
        print(f"Database '{DB_FILE}' initialized (Sensor & Auth tables ready).")
    except sqlite3.Error as e:
        print(f"Database initialization error: {e}")
    finally:
        if conn:
            conn.close()

def store_sensor_data(payload: dict):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO smartbox_data (box_id, temperature, humidity, latitude, longitude)
        VALUES (?, ?, ?, ?, ?);
        """, (
            payload.get("box_id"),
            payload.get("temperature"),
            payload.get("humidity"),
            payload.get("latitude"),
            payload.get("longitude")
        ))
        conn.commit()
        print(f"Data from '{payload.get('box_id')}' stored in SQLite.")
    except sqlite3.Error as e:
        print(f"Failed to store data: {e}")
    finally:
        if conn:
            conn.close()

# ==============================================================================
# SECTION 4: MQTT CLIENT
# ==============================================================================

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Failed to connect to MQTT, return code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        store_sensor_data(payload)
    except Exception as e:
        print(f"Error processing message: {e}")

def start_mqtt_listener():
    client = mqtt.Client(client_id=f"smartbox-backend-{int(time.time())}")
    client.on_connect = on_connect
    client.on_message = on_message
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"MQTT Listener Error: {e}")

# ==============================================================================
# SECTION 5: API SERVER (FLASK)
# ==============================================================================
app = Flask(__name__)
CORS(app)

@app.route('/api/data/<string:box_id>', methods=['GET'])
def get_data_by_box_id(box_id: str):
    limit = request.args.get('limit', 100, type=int)
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM smartbox_data WHERE box_id = ? ORDER BY timestamp DESC LIMIT ?",
            (box_id, limit)
        )
        rows = cursor.fetchall()
        data = [dict(row) for row in rows]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# --- AUTHENTICATION (SQLITE VERSION) ---

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username/password"}), 400

    username = data['username']
    password = data['password']
    email = data.get('email', '')

    password_hash = generate_password_hash(password)
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, password_hash)
        )
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Cari user berdasarkan username
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password_hash'], password):
            # Generate Token
            token_payload = {
                'user_id': user['id'],
                'username': user['username'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = jwt.encode(token_payload, JWT_SECRET, algorithm="HS256")
            
            return jsonify({
                "message": "Login successful",
                "token": token,
                "user": { "id": user['id'], "username": user['username'], "email": user['email'] }
            }), 200
        else:
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# ==============================================================================
# MAIN
# ==============================================================================
if __name__ == '__main__':
    initialize_database() # Pastikan tabel dibuat dulu
    
    print("Starting MQTT listener...")
    mqtt_thread = Thread(target=start_mqtt_listener)
    mqtt_thread.daemon = True
    mqtt_thread.start()
    
    print(f"Starting Flask API on port {API_PORT}...")
    app.run(host='0.0.0.0', port=API_PORT)