// src/App.jsx

// 👇 Hapus useState, useEffect jika tidak dipakai lagi di App.jsx
// import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute"; 
import SettingsPanel from "./components/SettingPanel";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

import { AuthProvider } from "./contexts/AuthContext";
// 👇 Hapus impor SettingsProvider jika sudah di main.jsx
// import { SettingsProvider } from "./contexts/SettingsContext";

import "./App.css";

function App() {
  const location = useLocation();
  const showFooter = location.pathname === "/";

  // Hapus semua state, ref, effect, dan fungsi yang sudah dipindah

  return (
    <AuthProvider> {/* AuthProvider membungkus semua */}
      <div className="app-container">
        <SettingsPanel />
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* 👇 Tambahkan Rute Signup di sini 👇 */}
          <Route path="/signup" element={<SignupPage />} />
          {/* 👆 Batas Rute Signup 👆 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
        </Routes>
        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;