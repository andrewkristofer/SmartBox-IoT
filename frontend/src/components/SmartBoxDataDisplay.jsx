// src/components/SmartBoxDataDisplay.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { Thermometer, Droplets, MapPin, Clock, AlertTriangle, CheckCircle, WifiOff, RefreshCw } from 'lucide-react';
import { getSmartBoxData } from '../services/api'; // Layanan API kita yang sudah ada
import '../App.css'; 

// Terima prop 'boxIds' dari DashboardPage
const SmartBoxDataDisplay = ({ boxIds }) => {
  const { t } = useTranslation();
  // 'fleetStatus' akan menyimpan data terbaru dari SEMUA box, 
  // diindeks berdasarkan boxId
  const [fleetStatus, setFleetStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const { temperatureUnit } = useSettings();

  // --- Fungsi Helper (Bisa dipindahkan ke file util terpisah) ---

  const convertTemperature = (celsius) => {
    if (temperatureUnit === "fahrenheit") {
      return (celsius * 9) / 5 + 32;
    }
    return celsius;
  };

  const getTemperatureUnit = () => (temperatureUnit === "fahrenheit" ? "°F" : "°C");

  // Perbarui fungsi getLogStatus untuk menangani status "Offline"
  const getLogStatus = (log) => {
    if (!log) {
      return { text: t('status.offline'), className: "status-offline", icon: <WifiOff size={16} /> };
    }
    if (!log.timestamp) {
      return { text: t('status.noData'), className: "status-unknown", icon: <AlertTriangle size={16} /> };
    }

    const isTempSafe = log.temperature >= 1.0 && log.temperature <= 4.0;
    const isHumidSafe = log.humidity >= 40.0 && log.humidity <= 60.0;

    if (isTempSafe && isHumidSafe) {
      return { text: t('status.safe'), className: "status-safe", icon: <CheckCircle size={16} /> };
    } else {
      return { text: t('status.danger'), className: "status-danger", icon: <AlertTriangle size={16} /> };
    }
  };

  // --- Logika Pengambilan Data ---

  // Gunakan useCallback agar fungsi ini stabil
  const fetchFleetData = useCallback(async () => {
    console.log("Fetching fleet data...");
    setIsLoading(true);
    setError(null);

    // 1. Buat array 'promises' untuk setiap panggilan API
    // Kita panggil getSmartBoxData dengan limit=1 untuk mendapatkan data *terbaru*
    const promises = boxIds.map(id => 
      getSmartBoxData(id, 1)
        .then(data => ({ id, status: 'fulfilled', data: data[0] })) // data[0] karena API mengembalikan array
        .catch(error => ({ id, status: 'rejected', error }))
    );

    // 2. Jalankan semua promise secara paralel
    const results = await Promise.allSettled(promises);

    // 3. Proses hasilnya menjadi satu state object
    const newFleetStatus = {};
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { id, data } = result.value;
        // Jika data[0] ada, simpan. Jika tidak (box belum pernah kirim data),
        // simpan 'null' agar bisa ditandai 'Belum Ada Data'
        newFleetStatus[id] = data || { id, timestamp: null }; 
      } else {
        // Jika promise gagal (misalnya error jaringan), tandai sebagai 'offline'
        const { id } = result.reason; // Asumsi error object memiliki ID, mari kita perbaiki
        // Jika getSmartBoxData di-reject, kita tidak tahu ID-nya. 
        // Kita harus memproses 'promises' yang asli, bukan 'results'
      }
    });
    
    // Mari kita gunakan cara yang lebih sederhana dengan 'promises'
    const settledPromises = await Promise.all(promises);
    const finalStatus = {};
    settledPromises.forEach(res => {
        finalStatus[res.id] = res.data; // res.data bisa undefined jika API gagal/box 404
    });

    setFleetStatus(finalStatus);
    setIsLoading(false);

  }, [boxIds, t]); // Hapus 't' jika getLogStatus dipindah

  // Ambil data saat komponen dimuat
  useEffect(() => {
    fetchFleetData();
    // Kita hapus interval refresh otomatis agar tidak membanjiri API
    // Kita akan tambahkan tombol refresh manual
  }, [fetchFleetData]);

  // --- Render (JSX) ---

  return (
    <div ref={containerRef} className="fleet-table-container">
      <div className="fleet-table-header">
        <h3>{t('dashboard.fleetTableTitle')}</h3>
        <button 
          onClick={fetchFleetData} 
          disabled={isLoading} 
          className="refresh-button"
        >
          <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          {isLoading ? t('loading', 'Memuat...') : t('refresh', 'Refresh')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      <table className="fleet-table">
        <thead>
          <tr>
            <th>{t('dashboard.table.boxId')}</th>
            <th>{t('dashboard.table.status')}</th>
            <th>{t('dashboard.table.temp')}</th>
            <th>{t('dashboard.table.humidity')}</th>
            <th>{t('dashboard.table.location')}</th>
            <th>{t('dashboard.table.lastSeen')}</th>
          </tr>
        </thead>
        <tbody>
          {/* Ubah 'boxIds.map' menjadi mapping dari state 'fleetStatus' */}
          {boxIds.map(id => {
            const log = fleetStatus[id]; // Dapatkan data terbaru untuk ID ini dari state
            const status = getLogStatus(log);
            const gmapsUrl = (log?.latitude && log?.longitude)
              ? `https://www.google.com/maps?q=${log.latitude},${log.longitude}`
              : "#";

            return (
              <tr key={id}>
                {/* ID Box */}
                <td><strong>{id}</strong></td>
                
                {/* Status */}
                <td>
                  <span className={`status-badge ${status.className}`}>
                    {status.icon}
                    {status.text}
                  </span>
                </td>
                
                {/* Suhu */}
                <td>
                  {typeof log?.temperature === 'number'
                    ? `${convertTemperature(log.temperature).toFixed(2)} ${getTemperatureUnit()}`
                    : '—'}
                </td>
                
                {/* Kelembapan */}
                <td>
                  {typeof log?.humidity === 'number'
                    ? `${log.humidity.toFixed(2)} %`
                    : '—'}
                </td>
                
                {/* Lokasi */}
                <td>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`location-link ${gmapsUrl === '#' ? 'disabled' : ''}`}
                  _>
                    <MapPin size={16} />
                    {gmapsUrl !== '#' ? t('viewMap', 'Lihat Peta') : t('na', 'N/A')}
                  </a>
                </td>
                
                {/* Terakhir Dilihat */}
                <td>
                  {log?.timestamp 
                    ? new Date(log.timestamp).toLocaleString("id-ID") 
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Tampilkan pesan loading di bawah tabel */}
      {isLoading && <p className="loading-text">{t('loading', 'Mengambil data armada...')}</p>}

    </div>
  );
};

export default SmartBoxDataDisplay;