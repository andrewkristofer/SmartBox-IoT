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

# Konfigurasi MQTT & Database
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "smartbox/kelompok11/data")
API_PORT = int(os.getenv("API_PORT", 5000))
DB_FILE_NAME = os.getenv("DB_FILE", "smartbox_data.db")
DB_FILE = os.path.join(script_dir, DB_FILE_NAME)
JWT_SECRET = os.getenv("JWT_SECRET", "rahasia_default_kalau_env_hilang") 

# ==============================================================================
# SECTION 3: DATABASE MANAGEMENT
# ==============================================================================

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row 
    return conn

def initialize_database():
    """Membuat tabel jika belum ada dan seeding super admin."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Tabel Data Sensor
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

        # 2. Tabel Users (Akun Login)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin', 
            is_approved INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 3. Tabel Profil Mitra (Info Bisnis)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS mitra_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            business_name TEXT,
            business_type TEXT,
            address TEXT,
            phone TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
        """)
        
        conn.commit()
        print(f"Database '{DB_FILE}' initialized.")
        
        # --- SEEDING SUPER ADMIN ---
        try:
            super_pass = generate_password_hash("password123")
            # Super Admin langsung aktif (is_approved=1)
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, role, is_approved)
                VALUES (?, ?, ?, ?, ?)
            """, ("superadmin", "super@smartbox.id", super_pass, "super_admin", 1))
            conn.commit()
            print("Super Admin account created (User: superadmin, Pass: password123)")
        except sqlite3.IntegrityError:
            pass # Sudah ada, skip

    except sqlite3.Error as e:
        print(f"Database initialization error: {e}")
    finally:
        if conn: conn.close()

def store_sensor_data(payload: dict):
    """Menyimpan data sensor dari MQTT ke SQLite."""
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
        print(f"Data from '{payload.get('box_id')}' stored.")
    except sqlite3.Error as e:
        print(f"Failed to store data: {e}")
    finally:
        if conn: conn.close()

# ==============================================================================
# SECTION 4: MQTT CLIENT
# ==============================================================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Failed to connect to MQTT: {rc}")

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

# --- ENDPOINT DATA UMUM ---

@app.route('/api/data/<string:box_id>', methods=['GET'])
def get_data_by_box_id(box_id: str):
    """Mengambil riwayat data sensor untuk satu box tertentu."""
    limit = request.args.get('limit', 100, type=int)
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM smartbox_data WHERE box_id = ? ORDER BY timestamp DESC LIMIT ?",
            (box_id, limit)
        )
        data = [dict(row) for row in cursor.fetchall()]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# --- ENDPOINT OTENTIKASI (REGISTER & LOGIN) ---

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """Pendaftaran mitra baru (User + Profil Bisnis)."""
    data = request.get_json()
    
    # Data Akun
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    
    # Data Profil Mitra
    business_name = data.get('business_name', '')
    business_type = data.get('business_type', '')
    address = data.get('address', '')
    phone = data.get('phone', '')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    password_hash = generate_password_hash(password)
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Simpan User (Role default 'admin', status 'pending'/0)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role, is_approved) VALUES (?, ?, ?, 'admin', 0)",
            (username, email, password_hash)
        )
        user_id = cursor.lastrowid

        # 2. Simpan Profil Mitra
        cursor.execute(
            "INSERT INTO mitra_profiles (user_id, business_name, business_type, address, phone) VALUES (?, ?, ?, ?, ?)",
            (user_id, business_name, business_type, address, phone)
        )

        conn.commit()
        return jsonify({"message": "Registrasi berhasil. Menunggu persetujuan Super Admin."}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username sudah digunakan"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """Login user dengan pengecekan status approval."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if user and check_password_hash(user['password_hash'], password):
            
            # --- CEK STATUS APPROVAL ---
            if user['is_approved'] == 0:
                return jsonify({"error": "Akun Anda belum disetujui oleh Super Admin."}), 403

            # Generate Token
            token_payload = {
                'user_id': user['id'],
                'username': user['username'],
                'role': user['role'], 
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = jwt.encode(token_payload, JWT_SECRET, algorithm="HS256")
            
            return jsonify({
                "message": "Login successful",
                "token": token,
                "user": { 
                    "id": user['id'], 
                    "username": user['username'], 
                    "email": user['email'],
                    "role": user['role'] 
                }
            }), 200
        else:
            return jsonify({"error": "Username atau password salah"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# --- ENDPOINT SUPER ADMIN ---

@app.route('/api/admin/users', methods=['GET'])
def get_pending_users():
    """Mengambil daftar user yang belum disetujui (is_approved=0)."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Query JOIN untuk mengambil data user + profil bisnisnya
        query = """
            SELECT u.id, u.username, u.email, u.created_at, 
                   m.business_name, m.business_type, m.address, m.phone
            FROM users u
            LEFT JOIN mitra_profiles m ON u.id = m.user_id
            WHERE u.is_approved = 0
        """
        cursor.execute(query)
        users = [dict(row) for row in cursor.fetchall()]
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/admin/approve/<int:user_id>', methods=['POST'])
def approve_user(user_id):
    """Menyetujui pendaftaran mitra (ubah is_approved jadi 1)."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_approved = 1 WHERE id = ?", (user_id,))
        conn.commit()
        return jsonify({"message": f"User ID {user_id} approved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/admin/devices', methods=['GET'])
def get_all_active_devices():
    """Mengambil SEMUA Box ID yang ada di database (untuk Global Monitoring)."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Ambil ID unik dari tabel data sensor
        cursor.execute("SELECT DISTINCT box_id FROM smartbox_data")
        rows = cursor.fetchall()
        # Convert ke list string sederhana: ["SMARTBOX-001", "SMARTBOX-002"]
        device_ids = [row['box_id'] for row in rows]
        return jsonify(device_ids)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================
if __name__ == '__main__':
    initialize_database()
    
    print("Starting MQTT listener...")
    mqtt_thread = Thread(target=start_mqtt_listener)
    mqtt_thread.daemon = True
    mqtt_thread.start()
    
    print(f"Starting Flask API on port {API_PORT}...")
    app.run(host='0.0.0.0', port=API_PORT)