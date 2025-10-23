// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(() => {
      try {
          // Pastikan item ada sebelum parsing
          const storedUser = localStorage.getItem('currentUser');
          return storedUser ? JSON.parse(storedUser) : null;
      } catch {
          return null;
      }
  });

  // 👇 HAPUS DEKLARASI STATE isAuthenticated INI
  /*
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  */

  // 👇 GUNAKAN DERIVED STATE INI SAJA
  const isAuthenticated = !!authToken; // true jika authToken ada

  const login = (token, user) => {
    // Validasi sederhana (jangan simpan jika token/user null/undefined)
    if (token && user) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setAuthToken(token);
        setCurrentUser(user);
        console.log("User logged in with token:", token);
    } else {
        console.error("Login function called without valid token or user data.");
        // Mungkin logout untuk membersihkan state jika data tidak valid
        logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setAuthToken(null);
    setCurrentUser(null);
    console.log("User logged out");
  };

  const value = {
    isAuthenticated,
    authToken,
    currentUser,
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