"""
Backend server for the Smart Box IoT project.

Author: Kelompok 11 - Universitas Indonesia
Version: 1.2 (Implement .env and JWT)
Date: 2025-10-28

This script performs two main functions:
1.  Listens for incoming data from Smart Box devices via an MQTT broker
    and stores it in an SQLite database.
2.  Provides a simple Flask-based REST API to retrieve the stored data.

The MQTT listener and the Flask server run concurrently in separate threads.
"""

# ==============================================================================
# SECTION 1: IMPORTS
# ==============================================================================
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
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# =Otomatis
# SECTION 2: KONFIGURASI
# ==============================================================================

# Tentukan path ke direktori script dan file .env
# Ini mengasumsikan file .env Anda berada SATU LEVEL DI ATAS folder backend
script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(script_dir, '..', '.env') # <-- BARU

# Muat environment variables dari file .env
load_dotenv(dotenv_path=dotenv_path) # <-- BARU

# --- Ambil Konfigurasi dari Environment Variables ---
MQTT_BROKER = os.getenv("MQTT_BROKER") # <-- DIUBAH
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883)) # <-- DIUBAH (dengan default)
MQTT_TOPIC = os.getenv("MQTT_TOPIC") # <-- DIUBAH
API_PORT = int(os.getenv("API_PORT", 5000)) # <-- DIUBAH (dengan default)

# Path ke DB SQLite (relatif terhadap script backend.py)
DB_FILE_NAME = os.getenv("DB_FILE", "smartbox_data.db") # <-- DIUBAH
DB_FILE = os.path.join(script_dir, DB_FILE_NAME) # <-- DIUBAH

# Konfigurasi MongoDB dan JWT
MONGO_URI = os.getenv("MONGO_URI") # <-- DIUBAH
MONGO_DB_NAME = "smartbox_auth" # (Bisa juga dimasukkan ke .env jika mau)
JWT_SECRET = os.getenv("JWT_SECRET") # <-- BARU (Kunci rahasia untuk token)

# Periksa apakah variabel penting sudah dimuat
if not all([MONGO_URI, JWT_SECRET, MQTT_BROKER, MQTT_TOPIC]): # <-- BARU
    print("FATAL ERROR: Variabel .env (MONGO_URI, JWT_SECRET, MQTT_BROKER, MQTT_TOPIC) tidak ditemukan.")
    print(f"Mencoba memuat dari: {dotenv_path}")
    # exit(1) # Hentikan eksekusi jika variabel penting tidak ada

# ==============================================================================
# SECTION 3: DATABASE MANAGEMENT
# ==============================================================================

try:
    mongo_client = MongoClient(MONGO_URI)
    mongo_client.admin.command('ping') # Cek koneksi
    mongo_db = mongo_client[MONGO_DB_NAME]
    users_collection = mongo_db["users"]
    users_collection.create_index("username", unique=True) # Pastikan username unik
    print("Successfully connected to MongoDB.")
except ConnectionFailure as e:
    print(f"Could not connect to MongoDB: {e}")
    mongo_client = None
except Exception as e:
    print(f"An error occurred during MongoDB setup: {e}")
    mongo_client = None

def initialize_database():
    """
    Initializes the SQLite database.
    
    Connects to the database file and creates the `smartbox_data` table
    if it does not already exist. This ensures the schema is ready before
    the application starts accepting data.
    """
    try:
        conn = sqlite3.connect(DB_FILE) # <-- DIUBAH (menggunakan var DB_FILE)
        cursor = conn.cursor()
        create_table_query = """
        CREATE TABLE IF NOT EXISTS smartbox_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            box_id TEXT NOT NULL,
            temperature REAL,
            humidity REAL,
            latitude REAL,
            longitude REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """
        cursor.execute(create_table_query)
        conn.commit()
        print(f"Database '{DB_FILE}' is initialized and ready.") # <-- DIUBAH
    except sqlite3.Error as e:
        print(f"Database initialization error: {e}")
    finally:
        if conn:
            conn.close()

def store_sensor_data(payload: dict):
    """
    Inserts a new record of sensor data into the database.

    Args:
        payload (dict): A dictionary containing the sensor data, typically
                        parsed from the MQTT message JSON.
    """
    try:
        conn = sqlite3.connect(DB_FILE) # <-- DIUBAH (menggunakan var DB_FILE)
        cursor = conn.cursor()
        insert_query = """
        INSERT INTO smartbox_data (box_id, temperature, humidity, latitude, longitude)
        VALUES (?, ?, ?, ?, ?);
        """
        data_tuple = (
            payload.get("box_id"),
            payload.get("temperature"),
            payload.get("humidity"),
            payload.get("latitude"),
            payload.get("longitude")
        )
        cursor.execute(insert_query, data_tuple)
        conn.commit()
        print(f"Data from '{payload.get('box_id')}' stored successfully.")
    except sqlite3.Error as e:
        print(f"Failed to store data: {e}")
    finally:
        if conn:
            conn.close()

# ==============================================================================
# SECTION 4: MQTT CLIENT
# ==============================================================================

def on_connect(client, userdata, flags, rc):
    """Callback function for when the client connects to the MQTT broker."""
    if rc == 0:
        print("Successfully connected to MQTT Broker!")
        client.subscribe(MQTT_TOPIC) # <-- DIUBAH (menggunakan var)
        print(f"Subscribed to topic: {MQTT_TOPIC}") # <-- DIUBAH (menggunakan var)
    else:
        print(f"Failed to connect to MQTT Broker, return code {rc}")

def on_message(client, userdata, msg):
    """Callback function for when a message is received from the broker."""
    print(f"Message received on topic '{msg.topic}'")
    try:
        payload = json.loads(msg.payload.decode())
        store_sensor_data(payload)
    except json.JSONDecodeError:
        print("Error: Received message is not a valid JSON format.")
    except Exception as e:
        print(f"An error occurred in on_message: {e}")

def start_mqtt_listener():
    """
    Initializes and starts the MQTT client in a blocking loop.
    
    This function is intended to be run in a separate thread to avoid
    blocking the main application (Flask server).
    """
    client_id = f"smartbox-backend-py-{int(time.time())}"
    client = mqtt.Client(client_id=client_id)
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60) # <-- DIUBAH (menggunakan var)
        client.loop_forever()
    except Exception as e:
        print(f"Could not start MQTT listener: {e}")

# ==============================================================================
# SECTION 5: API SERVER (FLASK)
# ==============================================================================
app = Flask(__name__)
CORS(app)

@app.route('/api/data/<string:box_id>', methods=['GET'])
def get_data_by_box_id(box_id: str):
    """
    API endpoint to retrieve sensor data for a specific Smart Box.
    ...
    """
    limit = request.args.get('limit', 100, type=int)
    try:
        conn = sqlite3.connect(DB_FILE) # <-- DIUBAH (menggunakan var DB_FILE)
        conn.row_factory = sqlite3.Row  # Return rows as dict-like objects
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM smartbox_data WHERE box_id = ? ORDER BY timestamp DESC LIMIT ?",
            (box_id, limit)
        )
        
        rows = cursor.fetchall()
        data = [dict(row) for row in rows]
        
        return jsonify(data)
    except sqlite3.Error as e:
        return jsonify({"error": f"Database query failed: {e}"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """ Registers a new user using MongoDB. """
    if not mongo_client: # Periksa koneksi MongoDB
        return jsonify({"error": "Database connection failed"}), 500

    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username or password"}), 400

    username = data['username']
    password = data['password']
    email = data.get('email') 

    # --- Validasi Sederhana (Bisa Ditambahkan) ---
    if len(password) < 6: # <-- BARU (Contoh validasi)
         return jsonify({"error": "Password must be at least 6 characters long"}), 400
    if not email: # <-- BARU (Contoh validasi)
         return jsonify({"error": "Email is required"}), 400

    password_hash = generate_password_hash(password)

    try:
        users_collection.insert_one({
            "username": username,
            "password_hash": password_hash,
            "email": email
        })
        print(f"User '{username}' registered successfully in MongoDB.")
        return jsonify({"message": "User registered successfully"}), 201
    except DuplicateKeyError:
        print(f"Registration failed: Username '{username}' already exists.")
        return jsonify({"error": "Username already exists"}), 409 
    except Exception as e:
        print(f"MongoDB error during registration: {e}")
        return jsonify({"error": f"Database error during registration: {e}"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """ Logs in a user using MongoDB. """
    if not mongo_client: 
        return jsonify({"error": "Database connection failed"}), 500
        
    if not JWT_SECRET: # <-- BARU (Pastikan JWT_SECRET ada)
        print("FATAL: JWT_SECRET is not set in .env file.")
        return jsonify({"error": "Server configuration error"}), 500

    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing username or password"}), 400

    username = data['username']
    password = data['password']

    try:
        user_data = users_collection.find_one({"username": username})

        if user_data and check_password_hash(user_data['password_hash'], password):
            # Password cocok
            print(f"User '{username}' logged in successfully via MongoDB.")
            
            # --- BUAT TOKEN JWT (MENGGANTIKAN DUMMY_TOKEN) --- # <-- BARU
            token_payload = {
                'user_id': str(user_data['_id']), # ID pengguna
                'username': user_data['username'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # Masa berlaku: 24 jam
            }
            # 'HS256' adalah algoritma signing
            token = jwt.encode(token_payload, JWT_SECRET, algorithm="HS256")
            # --- SELESAI MEMBUAT TOKEN ---
            
            user_info = {
                "id": str(user_data['_id']), 
                "username": user_data['username'],
                "email": user_data.get('email') 
            }
            
            return jsonify({
                "message": "Login successful",
                "token": token, # <-- DIUBAH (Kirim token asli)
                "user": user_info
                }), 200 
        else:
            print(f"Failed MongoDB login attempt for username: '{username}'")
            return jsonify({"error": "Invalid username or password"}), 401 
    except Exception as e:
        print(f"MongoDB error during login: {e}")
        return jsonify({"error": f"Database error during login: {e}"}), 500

# ==============================================================================
# SECTION 6: MAIN EXECUTION
# ==============================================================================
if __name__ == '__main__':
    # 1. Ensure the database is ready for use.
    initialize_database()

    # 2. Pastikan MongoDB terhubung
    if not mongo_client:
        print("Exiting due to MongoDB connection failure.")
        exit(1)
    
    # 3. Start the MQTT listener in a background thread.
    print("Starting MQTT listener thread...")
    mqtt_thread = Thread(target=start_mqtt_listener)
    mqtt_thread.daemon = True
    mqtt_thread.start()
    
    # 4. Start the Flask web server in the main thread.
    print(f"Starting Flask API server on port {API_PORT}...")
    app.run(host='0.0.0.0', port=API_PORT)