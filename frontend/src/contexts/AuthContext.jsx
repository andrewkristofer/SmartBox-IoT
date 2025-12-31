// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  
  const [currentUser, setCurrentUser] = useState(() => {
      try {
          const storedUser = localStorage.getItem('currentUser');
          return storedUser ? JSON.parse(storedUser) : null;
      } catch {
          return null;
      }
  });

  const isAuthenticated = !!authToken;

  const login = (token, userData) => { // Saya ubah param jadi userData biar jelas
    if (token && userData) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setAuthToken(token);
        setCurrentUser(userData);
        console.log("Login success. User data saved:", userData); // Debug log
    } else {
        console.error("Login failed: Missing token or user data");
        logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // --- TAMBAHAN PENTING: BERSIHKAN DAFTAR SMARTBOX ---
    localStorage.removeItem('my_smartboxes'); 
    // ---------------------------------------------------

    setAuthToken(null);
    setCurrentUser(null);
    console.log("User logged out and storage cleared.");
  };

  // --- BAGIAN INI YANG DIPERBAIKI ---
  const value = {
    isAuthenticated,
    authToken,
    currentUser,       // Tetap simpan ini (kalau ada file lain yg pakai)
    user: currentUser, // <--- TAMBAHAN PENTING: Alias 'currentUser' jadi 'user'
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};