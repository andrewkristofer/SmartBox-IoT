/**
 * @file smartBox_Firmware.ino
 * @author Kelompok 11 - Universitas Indonesia
 * @brief Firmware for the Smart Box IoT device to monitor and transmit environmental data.
 * @version 1.0.2 (Syntax-Cutted Fix)
 * @date 2025-10-08
 *
 * @copyright Copyright (c) 2025
 *
 * This firmware performs the following key tasks:
 * 1. Reads temperature and humidity from a DHT11 sensor.
 * 2. Acquires GPS location data from a NEO-6M module.
 * 3. Controls actuators (LEDs, Buzzer, Peltier Cooler) based on sensor thresholds.
 * 4. Publishes the collected data to an MQTT broker at a fixed interval.
 * 5. Manages Wi-Fi and MQTT connections with automatic reconnection.
 */

//==============================================================================
// SECTION 1: LIBRARIES
//==============================================================================
#include <WiFi.h>
#include <PubSubClient.h>   // MQTT Communication
#include <DHT.h>            // Temperature & Humidity Sensor
#include <TinyGPS++.h>       // GPS Data Parsing
#include <HardwareSerial.h> // ESP32 Hardware Serial

//==============================================================================
// SECTION 2: CONFIGURATION
//==============================================================================
// --- Wi-Fi Credentials ---
const char* WIFI_SSID = "NAMA_WIFI_ANDA";     ///< @brief Your network SSID (name).
const char* WIFI_PASS = "PASSWORD_WIFI_ANDA"; ///< @brief Your network password.

// --- MQTT Broker Configuration ---
const char* MQTT_BROKER = "broker.hivemq.com";        ///< @brief Public MQTT broker for testing.
const int   MQTT_PORT   = 1883;                       ///< @brief Default unencrypted MQTT port.
const char* MQTT_TOPIC  = "smartbox/kelompok11/data"; ///< @brief MQTT topic for publishing data.
const char* BOX_ID      = "SMARTBOX-001";             ///< @brief Unique identifier for this device.

// --- System Parameters ---
const long PUBLISH_INTERVAL_MS = 30000; ///< @brief Data publishing interval (30 seconds).

//==============================================================================
// SECTION 3: HARDWARE PIN DEFINITIONS
//==============================================================================
#define DHT_PIN 4        ///< @brief Pin connected to the DHT11 data line.
#define GPS_RX_PIN 16    ///< @brief ESP32 RX pin, connected to GPS TX.
#define GPS_TX_PIN 17    ///< @brief ESP32 TX pin, connected to GPS RX.
#define LED_GREEN_PIN 25 ///< @brief Pin for the green status LED (safe condition).
#define LED_RED_PIN 26   ///< @brief Pin for the red warning LED (unsafe condition).
#define BUZZER_PIN 27    ///< @brief Pin for the audible warning buzzer.
#define PELTIER_PIN 14   ///< @brief Pin to control the Peltier cooler relay.

//==============================================================================
// SECTION 4: GLOBAL OBJECTS & VARIABLES
//==============================================================================
WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHT_PIN, DHT11);
HardwareSerial gpsSerial(2); // Use UART2 on ESP32
TinyGPSPlus gps;

unsigned long lastPublishTime = 0;

//==============================================================================
// SECTION 4.5 - FUNCTION PROTOTYPES
//==============================================================================
void setupWifi();
void reconnectMqtt();
void readSensors(float &temp, float &hum, float &lat, float &lon);
void processConditions(float temp, float hum);
void publishData(float temp, float hum, float lat, float lon);


//==============================================================================
// SECTION 5: CORE FUNCTIONS
//==============================================================================

/**
 * @brief Initializes serial communication, hardware pins, and network connections.
 * This function runs once at startup.
 */
void setup() {
    Serial.begin(115200);
    
    // Initialize hardware pins
    pinMode(LED_GREEN_PIN, OUTPUT);
    pinMode(LED_RED_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(PELTIER_PIN, OUTPUT);
    
    // Initialize sensors
    dht.begin();
    gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

    // Initialize network
    setupWifi();
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

/**
 * @brief Main execution loop.
 * Handles MQTT connection, processes GPS data, and periodically publishes sensor readings.
 */
void loop() {
    if (!mqttClient.connected()) {
        reconnectMqtt();
    }
    mqttClient.loop(); // Essential for maintaining the MQTT connection

    // Continuously process incoming GPS data
    while (gpsSerial.available() > 0) {
        gps.encode(gpsSerial.read());
    }

    // Publish data at the defined interval
    if (millis() - lastPublishTime > PUBLISH_INTERVAL_MS) {
        lastPublishTime = millis();
        
        float temperature, humidity, latitude, longitude;
        readSensors(temperature, humidity, latitude, longitude);
        
        processConditions(temperature, humidity);
        publishData(temperature, humidity, latitude, longitude);
    }
}

//==============================================================================
// SECTION 6: HELPER FUNCTIONS
//==============================================================================

/**
 * @brief Connects the device to the configured Wi-Fi network.
 * Blocks execution until a connection is established.
 */
void setupWifi() {
    delay(10);
    Serial.println("\nConnecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected successfully!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

/**
 * @brief Attempts to reconnect to the MQTT broker if the connection is lost.
 * Retries every 5 seconds until successful.
 */
void reconnectMqtt() {
    while (!mqttClient.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (mqttClient.connect(BOX_ID)) {
            Serial.println("connected!");
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" - retrying in 5 seconds");
            delay(5000);
        }
    }
}

/**
 * @brief Reads data from all connected sensors.
 * @param[out] temp The variable to store the temperature reading.
 * @param[out] hum The variable to store the humidity reading.
 * @param[out] lat The variable to store the latitude reading.
 * @param[out] lon The variable to store the longitude reading.
 */
void readSensors(float &temp, float &hum, float &lat, float &lon) {
    hum = dht.readHumidity();
    temp = dht.readTemperature(); // Celsius is default

    // Set default values in case of invalid readings
    if (isnan(hum) || isnan(temp)) {
        Serial.println("Failed to read from DHT sensor!");
        hum = 0.0; temp = 0.0;
    }
    
    if (gps.location.isValid()) {
        lat = gps.location.lat();
        lon = gps.location.lng();
    } else {
        lat = 0.0; lon = 0.0;
    }
} 

/**
 * @brief Evaluates sensor data against predefined thresholds and controls actuators.
 * @param temp The current temperature in Celsius.
 * @param hum The current relative humidity in percent.
 */
void processConditions(float temp, float hum) {
    bool isTempSafe = (temp >= 1.0 && temp <= 4.0);
    bool isHumidSafe = (hum >= 40.0 && hum <= 60.0);

    if (isTempSafe && isHumidSafe) {
        digitalWrite(LED_GREEN_PIN, HIGH);
        digitalWrite(LED_RED_PIN, LOW);
        digitalWrite(BUZZER_PIN, LOW);
    } else {
        digitalWrite(LED_GREEN_PIN, LOW);
        digitalWrite(LED_RED_PIN, HIGH);
        digitalWrite(BUZZER_PIN, HIGH);
        Serial.println("WARNING: Conditions are outside safe limits!");
    }

    // Automatic Cooler Control
    if (temp > 4.0) {
        digitalWrite(PELTIER_PIN, HIGH); // Turn cooler ON
    } else if (temp < 1.0) {
        digitalWrite(PELTIER_PIN, LOW);  // Turn cooler OFF
    }
}

/**
 * @brief Constructs a JSON payload and publishes it to the MQTT broker.
 * @param temp The temperature value to publish.
 * @param hum The humidity value to publish.
 * @param lat The latitude value to publish.
 * @param lon The longitude value to publish.
 */
void publishData(float temp, float hum, float lat, float lon) {
    char jsonPayload[200];
    snprintf(jsonPayload, 200,
             "{\"box_id\":\"%s\", \"temperature\":%.2f, \"humidity\":%.2f, \"latitude\":%.6f, \"longitude\":%.6f}",
             BOX_ID, temp, hum, lat, lon);

    if (mqttClient.publish(MQTT_TOPIC, jsonPayload)) {
        Serial.print("MQTT message published: ");
        Serial.println(jsonPayload);
    } else {
        Serial.println("MQTT message publish failed.");
    }
}