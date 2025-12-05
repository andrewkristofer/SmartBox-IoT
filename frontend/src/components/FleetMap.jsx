
// src/components/FleetMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import logo Anda untuk dijadikan icon
import SmartBoxLogo from '../assets/smartboxiotlogo.png';

// Konfigurasi Custom Icon
const smartBoxIcon = new L.Icon({
    iconUrl: SmartBoxLogo,
    iconSize: [40, 40], // Ukuran icon (sesuaikan jika terlalu besar/kecil)
    iconAnchor: [20, 40], // Titik mana dari gambar yang "menancap" di koordinat (tengah bawah)
    popupAnchor: [0, -40] // Posisi popup relatif terhadap icon
});

const FleetMap = ({ fleetData }) => {
    // Filter hanya box yang memiliki koordinat valid
    const validFleets = Object.values(fleetData).filter(
        box => box && box.latitude && box.longitude
    );

    // Default center (Jakarta/Depok) jika tidak ada data
    const defaultCenter = [-6.362480, 106.824050]; 

    return (
        <div className="map-wrapper">
            <MapContainer 
                center={validFleets.length > 0 ? [validFleets[0].latitude, validFleets[0].longitude] : defaultCenter} 
                zoom={13} 
                scrollWheelZoom={false}
                style={{ height: "400px", width: "100%", borderRadius: "15px", zIndex: 0 }}
            >
                {/* Tile Layer dari OpenStreetMap (Gratis) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Marker untuk setiap Smart Box */}
                {validFleets.map((box) => (
                    <Marker 
                        key={box.box_id || box.id} // Fallback ID
                        position={[box.latitude, box.longitude]} 
                        icon={smartBoxIcon} // <-- INI YANG BIKIN KEREN (Icon Sendiri)
                    >
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <strong>{box.box_id}</strong><br/>
                                🌡️ {box.temperature}°C <br/>
                                💧 {box.humidity}%
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default FleetMap;
