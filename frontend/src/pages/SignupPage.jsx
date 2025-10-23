// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import '../App.css';

const SignupPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
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
      setError(t('signup.passwordMismatch', 'Passwords do not match!'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('signup.genericError', 'Registration failed.'));
      }

      setSuccess(t('signup.success', 'Registration successful! Redirecting to login...'));
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message || t('signup.genericError', 'An error occurred during registration.'));
      console.error("Signup error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page-container login-page-container">
      <div className="signup-form-card login-form-card">
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

          <div className="form-group">
            <label htmlFor="email">{t('signup.emailLabel', 'Email')}</label>
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
              minLength="6"
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

          {error && <p className="login-error-message">{error}</p>}
          {success && <p className="signup-success-message">{success}</p>}

          <button type="submit" className="signup-button login-button" disabled={isLoading}>
            {isLoading ? t('signup.registering', 'Registering...') : (
              <>
                <UserPlus size={16} style={{ marginRight: '8px' }} />
                {t('signup.signupButton', 'Sign Up')}
              </>
            )}
          </button>
        </form>

        <p className="login-link-text signup-link-text">
          {t('signup.alreadyAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="login-link signup-link">
            {t('signup.loginHere', 'Login here')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
