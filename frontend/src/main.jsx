<<<<<<< HEAD
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n";
import { SettingsProvider } from "./contexts/SettingsContext.jsx"; 
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SettingsProvider } from './contexts/SettingsContext'
>>>>>>> f2f24cf2331af76a451e3b4a03e0c135c04ae1ac

createRoot(document.getElementById("root")).render(
  <StrictMode>
<<<<<<< HEAD
    <SettingsProvider>  {/* wrapped for all app */}
      <App />
    </SettingsProvider>
  </StrictMode>
);
=======
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </StrictMode>,
)
>>>>>>> f2f24cf2331af76a451e3b4a03e0c135c04ae1ac
