// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import '../App.css';
import styles from './AuthPage.module.css';
import { loginUser } from '../services/api';

const LoginPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await loginUser(username, password);
      
      // Simpan token dan data user ke context/localstorage
      login(data.token, data.user);
      
      // --- LOGIKA REDIRECT BERDASARKAN ROLE ---
      // Jika user adalah 'super_admin', arahkan ke halaman Admin Approval
      if (data.user.role === 'super_admin') {
        navigate('/admin');
      } else {
        // Jika user biasa (mitra), arahkan ke Dashboard utama
        navigate('/dashboard');
      }
      
    } catch (err) {
      // Menangani error dari backend, misal "Akun belum disetujui" atau "Password salah"
      setError(err.message || t('login.genericError', 'An error occurred during login.'));
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginFormCard}>
        <h2>{t('login.title', 'Admin Login')}</h2>
        <form onSubmit={handleLogin}>
          
          <div className="form-group">
            <label htmlFor="username">{t('login.usernameLabel', 'Username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              placeholder={t('login.usernamePlaceholder', 'Enter username')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.passwordLabel', 'Password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder={t('login.passwordPlaceholder', 'Enter password')}
            />
          </div>

          {/* Link Forgot Password SUDAH DIHAPUS DI SINI UNTUK CLEAN CODE */}

          {error && <p className={styles.loginErrorMessage}>{error}</p>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? t('login.loggingIn', 'Logging in...') : (
              <>
                <LogIn size={16} style={{ marginRight: '8px' }} />
                {t('login.loginButton', 'Login')}
              </>
            )}
          </button>
        </form>

        <p className={styles.signupLinkText}>
          {t('login.noAccount', 'Belum punya akun?')}{' '}
          <Link to="/signup" className={styles.signupLink}>
            {t('login.signUpHere', 'Daftar di sini')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;