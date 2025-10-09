"""
Backend server for the Smart Box IoT project.

Author: Kelompok 11 - Universitas Indonesia
Version: 1.1 (Portable DB Path)
Date: 2025-10

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
from threading import Thread
import paho.mqtt.client as mqtt
from flask import Flask, jsonify, request
from flask_cors import CORS
import os

# ==============================================================================
# SECTION 2: CONFIGURATION
# ==============================================================================
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "smartbox/kelompok11/data"  # Must match the firmware topic
API_PORT = 5000

script_dir = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(script_dir, "smartbox_data.db")

# ==============================================================================
# SECTION 3: DATABASE MANAGEMENT
# ==============================================================================

def initialize_database():
    """
    Initializes the SQLite database.
    
    Connects to the database file and creates the `smartbox_data` table
    if it does not already exist. This ensures the schema is ready before
    the application starts accepting data.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
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
        print(f"Database '{DB_FILE}' is initialized and ready.")
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
        conn = sqlite3.connect(DB_FILE)
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
        client.subscribe(MQTT_TOPIC)
        print(f"Subscribed to topic: {MQTT_TOPIC}")
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
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
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
    
    It accepts a `limit` query parameter to control the number of records
    returned. Defaults to 100 if not specified.

    Args:
        box_id (str): The unique identifier of the Smart Box.

    Returns:
        flask.Response: A JSON response containing a list of data records
                        or an error message.
    """
    limit = request.args.get('limit', 100, type=int)
    try:
        conn = sqlite3.connect(DB_FILE)
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

# ==============================================================================
# SECTION 6: MAIN EXECUTION
# ==============================================================================
if __name__ == '__main__':
    # 1. Ensure the database is ready for use.
    initialize_database()
    
    # 2. Start the MQTT listener in a background thread.
    print("Starting MQTT listener thread...")
    mqtt_thread = Thread(target=start_mqtt_listener)
    mqtt_thread.daemon = True
    mqtt_thread.start()
    
    # 3. Start the Flask web server in the main thread.
    print(f"Starting Flask API server on port {API_PORT}...")
    app.run(host='0.0.0.0', port=API_PORT)