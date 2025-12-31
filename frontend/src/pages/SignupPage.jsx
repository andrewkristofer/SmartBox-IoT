// src/pages/SignupPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Briefcase, Box } from 'lucide-react'; // Tambah ikon Box
import '../App.css';
import styles from './AuthPage.module.css';
import { registerUser } from '../services/api';

const SignupPage = () => {
  const { t } = useTranslation();

  // Data Akun
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Data Profil Mitra
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restoran');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Data Smartbox (Opsional) - INI YANG BARU
  const [optionalBoxId, setOptionalBoxId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('signup.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      // 1. Kirim Data ke Backend
      await registerUser({
        username, email, password,
        business_name: businessName,
        business_type: businessType,
        phone,
        address
      });

      // 2. LOGIKA PENDAFTARAN BOX (Client Side)
      // Jika user mengisi ID Box, simpan ke Local Storage browser ini
      if (optionalBoxId.trim() !== "") {
        const cleanId = optionalBoxId.trim();
        const savedDevices = JSON.parse(localStorage.getItem("my_smartboxes") || "[]");
        
        // Cek duplikat sebelum simpan
        if (!savedDevices.includes(cleanId)) {
            savedDevices.push(cleanId);
            localStorage.setItem("my_smartboxes", JSON.stringify(savedDevices));
        }
      }

      setSuccess("Registrasi berhasil! Silakan lapor ke Admin agar akun diaktifkan.");
      
      // Redirect ke login setelah 2 detik
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message || t('signup.genericError'));
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.loginPageContainer} ${styles.signupPageContainer}`}>
      <div className={`${styles.loginFormCard} ${styles.signupFormCard}`} style={{ maxWidth: '600px' }}>
        <h2>{t('signup.title')}</h2>

        {error && <p className={styles.loginErrorMessage}>{error}</p>}
        {success && <p className={styles.signupSuccessMessage}>{success}</p>}

        <form onSubmit={handleSignup} style={{ textAlign: 'left' }}>

          {/* SEKSI 1: INFO AKUN */}
          <h4 style={{ marginBottom: '1rem', color: 'var(--primary-blue)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} /> Info Akun
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Username" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email aktif" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
            </div>
            <div className="form-group">
              <label>Konfirmasi</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" />
            </div>
          </div>

          {/* SEKSI 2: PROFIL MITRA */}
          <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--primary-blue)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} /> Profil Mitra
          </h4>

          <div className="form-group">
            <label>Nama Usaha / Mitra</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Contoh: RM Padang Sederhana" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Jenis Usaha</label>
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <option value="Restoran">Restoran / Katering</option>
                <option value="Gudang">Gudang Logistik</option>
                <option value="Retail">Toko Retail</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="form-group">
              <label>No. Telepon</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812..." />
            </div>
          </div>

          <div className="form-group">
            <label>Alamat Lengkap</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="2" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="Alamat usaha"></textarea>
          </div>

          {/* SEKSI 3: REGISTRASI ALAT (OPSIONAL) */}
           <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--primary-blue)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={18} /> Registrasi Alat (Opsional)
          </h4>

          <div className="form-group">
            <label>ID Smartbox</label>
            <input
              type="text"
              placeholder="Contoh: SMARTBOX-001"
              value={optionalBoxId}
              onChange={(e) => setOptionalBoxId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Jika diisi, box ini akan otomatis muncul di dashboard Anda setelah login.
            </small>
          </div>

          <button type="submit" className="login-button" disabled={isLoading} style={{ marginTop: '2rem' }}>
            {isLoading ? t('signup.registering') : t('signup.signupButton')}
          </button>
        </form>

        <p className={styles.signupLinkText}>
          {t('signup.alreadyAccount')}{' '}
          <Link to="/login" className={styles.signupLink}>
            {t('signup.loginHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;