// src/components/SmartBoxDataDisplay.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { Thermometer, Droplets, MapPin, AlertTriangle, CheckCircle, WifiOff, RefreshCw } from 'lucide-react';
import { getSmartBoxData } from '../services/api';
import FleetMap from './FleetMap'; // Pastikan file ini sudah dibuat
import { Link } from 'react-router-dom';
import '../App.css';

const SmartBoxDataDisplay = ({ boxIds }) => {
  const { t } = useTranslation();
  const [fleetStatus, setFleetStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const { temperatureUnit, refreshInterval } = useSettings();

  const convertTemperature = (celsius) => {
    if (temperatureUnit === "fahrenheit") {
      return (celsius * 9) / 5 + 32;
    }
    return celsius;
  };

  const getTemperatureUnit = () => (temperatureUnit === "fahrenheit" ? "°F" : "°C");

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

  const fetchFleetData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    else setIsRefreshing(true);

    setError(null);

    const promises = boxIds.map(id =>
      getSmartBoxData(id, 1)
        .then(data => ({ id, status: 'fulfilled', data: data[0] }))
        .catch(error => ({ id, status: 'rejected', error }))
    );

    const results = await Promise.allSettled(promises);

    const newFleetStatus = {};
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { id, data } = result.value;
        newFleetStatus[id] = data || { id, timestamp: null };
      }
    });

    setFleetStatus(prev => ({ ...prev, ...newFleetStatus }));

    setIsLoading(false);
    setIsRefreshing(false);

  }, [boxIds]);

  useEffect(() => {
    fetchFleetData(false);
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchFleetData(true);
      }, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchFleetData, refreshInterval]);

  return (
    <div ref={containerRef} className="fleet-table-container">
      <div className="fleet-table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3>{t('dashboard.fleetTableTitle')}</h3>
          {isRefreshing && <span style={{ fontSize: '0.8rem', color: '#4FC3F7' }}>Updating...</span>}
        </div>

        <button
          onClick={() => fetchFleetData(false)}
          disabled={isLoading || isRefreshing}
          className="refresh-button"
        >
          <RefreshCw size={16} className={(isLoading || isRefreshing) ? 'spinning' : ''} />
          {isLoading ? t('loading', 'Memuat...') : t('settings.dataUpdate', 'Refresh')}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* PETA ARMADA (FLEET MAP) */}
      <div style={{ marginBottom: '2rem', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '15px', overflow: 'hidden' }}>
        <FleetMap fleetData={fleetStatus} />
      </div>

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
          {boxIds.map(id => {
            const log = fleetStatus[id];
            const status = getLogStatus(log);

            // Perbaikan URL GMaps yang benar
            const gmapsUrl = (log?.latitude && log?.longitude)
              ? `https://www.google.com/maps?q=${log.latitude},${log.longitude}`
              : "#";

            return (
              <tr key={id}>
                {/* 1. ID Box  */}
                <td>
                  <Link
                    to={`/dashboard/${id}`}
                    style={{ color: '#4FC3F7', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.05rem' }}
                  >
                    {id} ↗
                  </Link>
                </td>

                {/* 2. STATUS (Dikembalikan ke sini!) */}
                <td>
                  <span className={`status-badge ${status.className}`}>
                    {status.icon}
                    {status.text}
                  </span>
                </td>

                {/* 3. Suhu */}
                <td>
                  {typeof log?.temperature === 'number'
                    ? `${convertTemperature(log.temperature).toFixed(2)} ${getTemperatureUnit()}`
                    : '—'}
                </td>

                {/* 4. Kelembapan */}
                <td>
                  {typeof log?.humidity === 'number'
                    ? `${log.humidity.toFixed(2)} %`
                    : '—'}
                </td>

                {/* 5. Lokasi & Link Map */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`location-link ${gmapsUrl === '#' ? 'disabled' : ''}`}
                    >
                      <MapPin size={16} />
                      {gmapsUrl !== '#' ? t('dashboard.table.location', 'Lihat Peta') : 'N/A'}
                    </a>
                    {/* Tampilkan koordinat kecil di bawah link */}
                    {log?.latitude && (
                      <span style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px' }}>
                        {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </td>

                {/* 6. Terakhir Dilihat */}
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

      {isLoading && <p className="loading-text">{t('loading', 'Mengambil data armada...')}</p>}

    </div>
  );
};

export default SmartBoxDataDisplay;