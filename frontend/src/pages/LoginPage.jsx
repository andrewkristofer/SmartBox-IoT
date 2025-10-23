// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import '../App.css';

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('login.genericError', 'Invalid credentials'));
      }

      // Login berhasil
      login(data.token, data.user);
      navigate('/dashboard');

    } catch (err) {
      setError(err.message || t('login.genericError', 'An error occurred during login.'));
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
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

          {error && <p className="login-error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? t('login.loggingIn', 'Logging in...') : (
              <>
                <LogIn size={16} style={{ marginRight: '8px' }} />
                {t('login.loginButton', 'Login')}
              </>
            )}
          </button>
        </form>

        <p className="signup-link-text">
          {t('login.noAccount', 'Belum punya akun?')}{' '}
          <Link to="/signup" className="signup-link">
            {t('login.signUpHere', 'Daftar di sini')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
