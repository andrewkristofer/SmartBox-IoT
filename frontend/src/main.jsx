// src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 👇 Impor BrowserRouter
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./i18n";
import { SettingsProvider } from "./contexts/SettingsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 👇 Bungkus dengan BrowserRouter */}
    <BrowserRouter>
      {/* SettingsProvider membungkus App di sini */}
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BrowserRouter>
    {/* 👆 Akhir BrowserRouter */}
  </StrictMode>
);