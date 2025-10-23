// src/contexts/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react'; // Hapus useEffect jika tidak dipakai

// 1. Buat Context dan ekspor DENGAN NAMA (named export)
export const AuthContext = createContext(null); // Tambahkan 'export'

// 2. Buat Provider Component dan ekspor DENGAN NAMA
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const login = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
    console.log("User logged in");
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    console.log("User logged out");
  };

  // Nilai context tidak perlu diubah
  const value = {
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Buat custom hook dan ekspor DENGAN NAMA
export const useAuth = () => {
  const context = useContext(AuthContext); // useContext sekarang merujuk ke AuthContext yang di-ekspor
  if (!context) {
    // Pesan error lebih jelas
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 4. Hapus export default jika ada
// export default AuthContext; // <-- Hapus baris ini