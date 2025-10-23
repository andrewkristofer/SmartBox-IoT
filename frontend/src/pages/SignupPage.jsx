// src/pages/SignupPage.jsx

import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // Tidak perlu AuthContext di sini
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react'; // Ikon untuk tombol signup
import '../App.css';

const SignupPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Tambah state konfirmasi password
  const [email, setEmail] = useState(''); // Opsional: Tambah state email
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // State untuk pesan sukses
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // --- Validasi Sederhana di Frontend ---
    if (password !== confirmPassword) {
      setError(t('signup.passwordMismatch', 'Passwords do not match!'));
      setIsLoading(false);
      return; // Hentikan proses jika password tidak cocok
    }
    // Tambahkan validasi lain jika perlu (panjang password, format email)

    // --- LOGIKA PENDAFTARAN ---
    try {
      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Ganti ini dengan fetch API ke backend Anda (misal: POST /api/auth/register)
      console.log('Attempting signup with:', username, email, password); // Jangan log password di production
      // const response = await fetch('http://localhost:5000/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, email, password }) // Kirim data yang relevan
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Signup failed');
      // }

      // --- Simulasi Signup Berhasil ---
      // Anggap signup selalu berhasil untuk simulasi
      setSuccess(t('signup.success', 'Registration successful! Redirecting to login...'));
      // Arahkan ke halaman login setelah beberapa detik
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Tunggu 2 detik sebelum redirect
      // --- Akhir Simulasi ---

    } catch (err) {
      setError(err.message || t('signup.genericError', 'An error occurred during registration.'));
      console.error("Signup error:", err);
      setIsLoading(false); // Pastikan loading false jika error
    }
    // setIsLoading(false) tidak perlu di sini jika sukses karena ada redirect
  };

  return (
    <div className="signup-page-container login-page-container"> {/* Gunakan style yang mirip login */}
      <div className="signup-form-card login-form-card"> {/* Gunakan style yang mirip login */}
        <h2>{t('signup.title', 'Register Admin Account')}</h2>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="username">{t('signup.usernameLabel', 'Username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              placeholder={t('signup.usernamePlaceholder', 'Choose a username')}
            />
          </div>
          {/* Opsional: Input Email */}
          <div className="form-group">
            <label htmlFor="email">{t('signup.emailLabel', 'Email (Optional)')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder={t('signup.emailPlaceholder', 'Enter your email')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('signup.passwordLabel', 'Password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6" // Contoh: minimal 6 karakter
              disabled={isLoading}
              placeholder={t('signup.passwordPlaceholder', 'Create a password (min. 6 chars)')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel', 'Confirm Password')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              disabled={isLoading}
              placeholder={t('signup.confirmPasswordPlaceholder', 'Re-enter your password')}
            />
          </div>

          {error && <p className="login-error-message">{error}</p>} {/* Style error sama */}
          {success && <p className="signup-success-message">{success}</p>} {/* Buat style success */}

          <button type="submit" className="signup-button login-button" disabled={isLoading}> {/* Style mirip login */}
            {isLoading ? t('signup.registering', 'Registering...') : (
              <>
                <UserPlus size={16} style={{ marginRight: '8px' }} />
                {t('signup.signupButton', 'Sign Up')}
              </>
            )}
          </button>
        </form>

        <p className="login-link-text signup-link-text"> {/* Style mirip signup-link */}
          {t('signup.alreadyAccount', 'Already have an account?')}
          {' '}
          <Link to="/login" className="login-link signup-link"> {/* Style mirip signup-link */}
             {t('signup.loginHere', 'Login here')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;