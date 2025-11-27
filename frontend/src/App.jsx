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

import { AuthProvider } from "./contexts/AuthContext";
// 👇 2. Import Monitor Notifikasi yang baru dibuat
import FleetNotificationMonitor from "./components/FleetNotificationMonitor";

import "./App.css";

function App() {
  const location = useLocation();
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
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
        </Routes>
        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;