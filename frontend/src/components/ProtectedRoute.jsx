// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// 👇 Impor useAuth hook
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  // 👇 Gunakan useAuth untuk mendapatkan status login
  const { isAuthenticated } = useAuth();
  const location = useLocation(); // Opsional: untuk menyimpan lokasi asal

  if (!isAuthenticated) {
    // Jika belum login, arahkan ke halaman login
    // state={{ from: location }} berguna jika Anda ingin kembali ke halaman
    // dashboard setelah login berhasil, tapi ini opsional.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Jika sudah login, tampilkan komponen anak (DashboardPage)
  return children;
};

export default ProtectedRoute;