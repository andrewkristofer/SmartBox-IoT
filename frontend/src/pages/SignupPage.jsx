// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import '../App.css';
import styles from './AuthPage.module.css';
import { registerUser } from '../services/api';

const SignupPage = () => {
  const { t } = useTranslation();
  // PASTIKAN SEMUA STATE INI ADA DAN TIDAK DIKOMENTARI
  const [username, setUsername] = useState(''); // <-- PASTIKAN INI ADA
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ... (fungsi handleSignup Anda) ...
  const handleSignup = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('signup.passwordMismatch')); // Menggunakan key dari JSON
      setIsLoading(false);
      return;
    }

    try {
      const data = await registerUser({ username, email, password });
      setSuccess(t('signup.success')); // Menggunakan key dari JSON
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message || t('signup.genericError')); // Menggunakan key dari JSON
      console.error("Signup error:", err);
      setIsLoading(false);
    }
  };


  return (
    <div className={`${styles.loginPageContainer} ${styles.signupPageContainer}`}>
      <div className={`${styles.loginFormCard} ${styles.signupFormCard}`}>
        <h2>{t('signup.title')}</h2> {/* Menggunakan key dari JSON */}
        <form onSubmit={handleSignup}>
          
          <div className="form-group">
            <label htmlFor="username">{t('signup.usernameLabel')}</label> {/* Menggunakan key dari JSON */}
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              // TAMBAHKAN PLACEHOLDER
              placeholder={t('signup.usernamePlaceholder')} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('signup.emailLabel')}</label> {/* Menggunakan key dari JSON */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              // TAMBAHKAN PLACEHOLDER
              placeholder={t('signup.emailPlaceholder')} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('signup.passwordLabel')}</label> {/* Menggunakan key dari JSON */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={isLoading}
              // TAMBAHKAN PLACEHOLDER
              placeholder={t('signup.passwordPlaceholder')} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel')}</label> {/* Menggunakan key dari JSON */}
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              disabled={isLoading}
              // TAMBAHKAN PLACEHOLDER
              placeholder={t('signup.confirmPasswordPlaceholder')} 
            />
          </div>
          
          {error && <p className={styles.loginErrorMessage}>{error}</p>}
          {success && <p className={styles.signupSuccessMessage}>{success}</p>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? t('signup.registering') : ( /* Menggunakan key dari JSON */
              <>
                <UserPlus size={16} style={{ marginRight: '8px' }} />
                {/* PASTIKAN INI MENGGUNAKAN KEY DARI JSON */}
                {t('signup.signupButton')} 
              </>
            )}
          </button>
        </form>

        <p className={styles.signupLinkText}>
          {t('signup.alreadyAccount')}{' '} {/* Menggunakan key dari JSON */}
          <Link to="/login" className={styles.signupLink}>
            {t('signup.loginHere')} {/* Menggunakan key dari JSON */}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;