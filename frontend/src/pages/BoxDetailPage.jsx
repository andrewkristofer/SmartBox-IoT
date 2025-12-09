// src/pages/BoxDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Thermometer, Droplets, Clock, Download } from 'lucide-react'; 
import { getSmartBoxData } from '../services/api';
import { useTranslation } from 'react-i18next';
import '../App.css';

const BoxDetailPage = () => {
  const { boxId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FUNGSI EXPORT CSV ---
  const handleDownloadCSV = () => {
    const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
    window.open(`${BASE_URL}/api/export/${boxId}`, '_blank');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil data agak banyak (misal 600) untuk memastikan buffer cukup
        const limit = 600; 
        const result = await getSmartBoxData(boxId, limit);
        
        // --- LOGIKA FILTER WAKTU (BARU) ---
        // Kita hitung waktu batas: "Sekarang dikurangi 20 menit"
        const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

        // Filter: Hanya ambil data yang LEBIH BARU dari batas tersebut
        const timeFilteredData = result.filter(item => {
            // Konversi timestamp UTC database ke objek Date JS
            const itemDate = new Date(item.timestamp.replace(" ", "T") + "Z");
            return itemDate > twentyMinutesAgo;
        });
        // ----------------------------------

        const formattedData = timeFilteredData.map(item => ({
          ...item,
          // Format Jam (Sumbu X)
          time: new Date(item.timestamp.replace(" ", "T") + "Z").toLocaleTimeString('id-ID', { 
            timeZone: 'Asia/Jakarta',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          }),
          // Format Tanggal Lengkap (Tooltip)
          fullDate: new Date(item.timestamp.replace(" ", "T") + "Z").toLocaleString('id-ID', { 
            timeZone: 'Asia/Jakarta' 
          }) 
        })).reverse();
        
        setData(formattedData);
      } catch (error) {
        console.error("Gagal ambil data detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, [boxId]);

  if (loading) return <div className="loading-text" style={{padding: '5rem', textAlign:'center'}}>{t('loading', 'Loading...')}</div>;

  const latest = data[data.length - 1] || {};

  return (
    <div className="section" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* HEADER: Navigasi & Judul & Export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                  <ArrowLeft size={20} /> {t('detail.back')}
                </button>

                <h2 className="section-title" style={{ textAlign: 'left', margin: '0.5rem 0 0' }}>
                  {t('detail.title')}: <span style={{ color: '#4FC3F7' }}>{boxId}</span>
                </h2>
            </div>

            <button 
                onClick={handleDownloadCSV}
                className="refresh-button"
                style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    borderColor: '#059669',
                    marginTop: '1.5rem',
                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
                }}
            >
                <Download size={18} />
                Export CSV
            </button>
        </div>

        {/* KARTU STATISTIK (Ringkasan Data Terkini) */}
        <div className="stats-grid" style={{ marginBottom: '3rem' }}>
           <div className="stat-card visible">
              <Thermometer className="stat-icon" />
              <div className="stat-number">{latest.temperature?.toFixed(2)} °C</div>
              <div className="stat-label">{t('detail.currentTemp')}</div>
           </div>
           <div className="stat-card visible">
              <Droplets className="stat-icon" />
              <div className="stat-number">{latest.humidity?.toFixed(2)} %</div>
              <div className="stat-label">{t('detail.currentHum')}</div>
           </div>
           <div className="stat-card visible">
              <Clock className="stat-icon" />
              <div className="stat-number" style={{ fontSize: '2rem', marginTop: '1rem' }}>{latest.time}</div>
              <div className="stat-label">{t('detail.lastUpdate')}</div>
           </div>
        </div>

        {/* GRAFIK UTAMA */}
        <div className="chart-container">
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="chart-title" style={{margin:0}}>
              {t('detail.chartTitle')} (20 Menit Terakhir)
            </h3>
          </div>
          
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                
                {/* Sumbu X: Waktu */}
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  tick={{fontSize: 12}} 
                  interval="preserveStartEnd"
                  minTickGap={35} // Jarak antar jam di bawah grafik agar tidak numpuk
                />
                
                {/* Sumbu Y Kiri: Suhu */}
                <YAxis 
                  yAxisId="left" 
                  stroke="#94a3b8" 
                  label={{ value: t('detail.chartTemp'), angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: '#64748b'} }} 
                />
                
                {/* Sumbu Y Kanan: Kelembapan */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#94a3b8" 
                  label={{ value: t('detail.chartHum'), angle: 90, position: 'insideRight', style: {textAnchor: 'middle', fill: '#64748b'} }} 
                />
                
                <Tooltip 
                  labelFormatter={(label) => `Pukul ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '5px' }}
                />
                <Legend verticalAlign="top" height={36}/>
                
                {/* Garis Batas Aman (4 Derajat) */}
                <ReferenceLine y={4} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Max Safe (4°C)", position: 'right', fill: '#ef4444', fontSize: 12 }} />
                
                {/* Garis Data Suhu */}
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="temperature" 
                  name={t('detail.chartTemp')} 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6 }}
                  isAnimationActive={false} // Animasi OFF biar responsif
                />
                
                {/* Garis Data Kelembapan */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="humidity" 
                  name={t('detail.chartHum')} 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6 }} 
                  isAnimationActive={false} // Animasi OFF biar responsif
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxDetailPage;