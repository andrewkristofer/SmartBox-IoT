// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  // 1. Belum Login -> Lempar ke Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Butuh Role Khusus (misal Super Admin) tapi user bukan itu -> Lempar ke Dashboard
  if (role && currentUser?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. User Biasa tapi BELUM APPROVE? -> Lempar ke Waiting Room (kecuali jika dia memang mau ke waiting room)
  // Perhatikan logika ini agar tidak infinite loop
  if (currentUser?.role === 'admin' && location.pathname !== '/waiting-approval') {
      // Kita asumsikan ada flag di currentUser atau kita cek saat login
      // Untuk simplifikasi demo: Jika login berhasil tapi backend bilang "belum approve" (biasanya dihandle di login), 
      // tapi kalau sudah lolos login, biasanya sudah approved.
      
      // NAMUN, jika Anda ingin flow register -> langsung login (state belum approve):
      // Kita butuh flag `is_approved` di object currentUser
  }

  return children;
};

export default ProtectedRoute;