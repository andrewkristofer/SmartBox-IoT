// src/pages/BoxDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Thermometer, Droplets, Clock } from 'lucide-react';
import { getSmartBoxData } from '../services/api';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../App.css';

const BoxDetailPage = () => {
  const { boxId } = useParams();
  const navigate = useNavigate();
  // 2. DESTRUCTURE t
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleDownloadCSV = () => {
    // URL Backend Langsung (karena ini download file, bukan JSON fetch)
    const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    window.open(`${BASE_URL}/api/export/${boxId}`, '_blank');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSmartBoxData(boxId, 20);
        const formattedData = result.map(item => ({
          ...item,
          time: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          fullDate: new Date(item.timestamp).toLocaleString('id-ID')
        })).reverse();
        setData(formattedData);
      } catch (error) {
        console.error("Gagal ambil data detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [boxId]);

  if (loading) return <div className="loading-text" style={{ padding: '5rem', textAlign: 'center' }}>{t('loading', 'Loading...')}</div>;

  const latest = data[data.length - 1] || {};

  return (
    <div className="section" style={{ paddingTop: '100px', minHeight: '100vh' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* TOMBOL BACK: Pakai class 'back-btn' dan translasi */}
        <button
          onClick={() => navigate('/dashboard')}
          className="back-btn"
        >
          <ArrowLeft size={20} /> {t('detail.back')}
        </button>

        {/* JUDUL: Pakai translasi */}
        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
          {t('detail.title')}: <span style={{ color: '#4FC3F7' }}>{boxId}</span>
        </h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ textAlign: 'left', margin: 0 }}>
            {t('detail.title')}: <span style={{ color: '#4FC3F7' }}>{boxId}</span>
          </h2>

          <button
            onClick={handleDownloadCSV}
            className="refresh-button" // Reuse style tombol refresh yang kita buat sebelumnya
            style={{ background: '#10b981', color: 'white', borderColor: '#059669' }}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* KARTU STATISTIK: Pakai translasi */}
        <div className="stats-grid" style={{ marginBottom: '3rem' }}>
          <div className="stat-card visible" style={{ animationDelay: '0ms' }}>
            <Thermometer className="stat-icon" />
            <div className="stat-number">{latest.temperature?.toFixed(2)} °C</div>
            <div className="stat-label">{t('detail.currentTemp')}</div>
          </div>
          <div className="stat-card visible" style={{ animationDelay: '100ms' }}>
            <Droplets className="stat-icon" />
            <div className="stat-number">{latest.humidity?.toFixed(2)} %</div>
            <div className="stat-label">{t('detail.currentHum')}</div>
          </div>
          <div className="stat-card visible" style={{ animationDelay: '200ms' }}>
            <Clock className="stat-icon" />
            <div className="stat-number" style={{ fontSize: '2.5rem', marginTop: '1rem' }}>{latest.time}</div>
            <div className="stat-label">{t('detail.lastUpdate')}</div>
          </div>
        </div>

        {/* GRAFIK: Pakai class 'chart-container' & translasi */}
        <div className="chart-container">
          <h3 className="chart-title">
            {t('detail.chartTitle')}
          </h3>

          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" label={{ value: t('detail.chartTemp'), angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: t('detail.chartHum'), angle: 90, position: 'insideRight' }} />
                <Tooltip labelStyle={{ color: 'black' }} />
                <Legend />

                {/* Translasi Label Reference Line */}
                <ReferenceLine y={4} yAxisId="left" label={t('detail.safeMax')} stroke="red" strokeDasharray="3 3" />
                <ReferenceLine y={1} yAxisId="left" label={t('detail.safeMin')} stroke="blue" strokeDasharray="3 3" />

                {/* Translasi Nama Line */}
                <Line yAxisId="left" type="monotone" dataKey="temperature" name={t('detail.chartTemp')} stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name={t('detail.chartHum')} stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxDetailPage;