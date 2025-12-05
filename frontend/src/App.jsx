// src/App.jsx

// import { useState, useEffect } from "react"; // <-- Hapus ini jika belum dihapus
import { Routes, Route, useLocation } from "react-router-dom";
// 👇 1. Import Toaster dari react-hot-toast
import { Toaster } from 'react-hot-toast';

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SettingsPanel from "./components/SettingPanel";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BoxDetailPage from "./pages/BoxDetailPage";
import AdminPage from "./pages/AdminPage";
import WaitingApproval from "./pages/WaitingApproval"; 

import { AuthProvider } from "./contexts/AuthContext";
// 👇 2. Import Monitor Notifikasi yang baru dibuat
import FleetNotificationMonitor from "./components/FleetNotificationMonitor";

import "./App.css";

function App() {
  const location = useLocation();
  
  // Footer hanya tampil di halaman Landing Page ("/")
  const showFooter = location.pathname === "/";

  return (
    <AuthProvider> {/* AuthProvider membungkus semua */}
      
      {/* 👇 3. Pasang Monitor di sini (Di dalam AuthProvider agar bisa akses user login) */}
      <FleetNotificationMonitor />
      
      {/* 👇 4. Pasang Toaster (UI Notifikasi) */}
      <Toaster 
        position="bottom-right" // Sesuai permintaan
        reverseOrder={false}
        toastOptions={{
          // Opsi global jika diperlukan
          style: {
            zIndex: 9999,
          },
        }}
      />

      <div className="app-container">
        <SettingsPanel />
        <Header />
        
        {/* --- AREA ROUTING --- */}
        {/* SEMUA <Route> WAJIB ADA DI DALAM <Routes> */}
        <Routes>
          {/* 1. Halaman Publik */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* 2. Halaman Dashboard Mitra */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:boxId"
            element={
              <ProtectedRoute>
                <BoxDetailPage />
              </ProtectedRoute>
            }
          />

          {/* 3. Halaman Super Admin */}
          {/* PINDAHKAN KE SINI (MASUK KE DALAM ROUTES) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="super_admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* 4. Halaman Menunggu Approval */}
          {/* PINDAHKAN KE SINI (MASUK KE DALAM ROUTES) */}
          <Route
            path="/waiting-approval"
            element={
              <ProtectedRoute>
                <WaitingApproval />
              </ProtectedRoute>
            }
          />

        </Routes>
        {/* --- AKHIR AREA ROUTING --- */}

        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;