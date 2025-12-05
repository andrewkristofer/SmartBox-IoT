// src/pages/WaitingApproval.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/api'; // Kita butuh re-login background
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import '../App.css';

const WaitingApproval = () => {
  const { currentUser, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  // Fungsi untuk mengecek status terbaru
  // Triknya: Kita coba login ulang user ini secara background dengan password yang tersimpan (opsional)
  // ATAU lebih aman: Kita buat endpoint khusus `/api/auth/status` (tapi biar cepat, kita suruh user cek manual atau polling profile)
  
  // Karena keterbatasan waktu dan kompleksitas menyimpan password untuk re-login otomatis,
  // Skenario terbaik: Minta user menunggu, dan tombol "Cek Status" manual atau auto-refresh halaman.
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="stat-card" style={{ maxWidth: '500px', width: '90%', padding: '3rem 2rem' }}>
        
        <div className="stat-icon" style={{ background: '#fef9c3', color: '#ca8a04', width:'5rem', height:'5rem' }}>
          <Clock size={48} />
        </div>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Menunggu Persetujuan</h2>
        
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '2rem' }}>
          Halo <strong>{currentUser?.username}</strong>,<br/>
          Pendaftaran Anda berhasil dicatat. Saat ini Administrator kami sedang memverifikasi data kemitraan Anda.
        </p>

        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', marginBottom:'2rem' }}>
          Silakan hubungi Admin Kelompok 11 jika proses ini memakan waktu terlalu lama.
        </div>

        <button 
          className="login-button" 
          onClick={() => window.location.reload()} // Simple reload to re-check auth state if backend updates session
          style={{ marginBottom: '1rem' }}
        >
          <RefreshCw size={18} /> Cek Status Saya
        </button>

        <button 
          onClick={handleLogout}
          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration:'underline' }}
        >
          <LogOut size={16} style={{display:'inline', marginRight:'5px'}}/> Keluar / Login Ulang
        </button>

      </div>
    </div>
  );
};

export default WaitingApproval;