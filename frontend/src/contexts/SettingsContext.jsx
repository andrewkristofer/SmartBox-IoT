import { createContext, useContext, useState, useEffect } from "react";
import i18n from "../i18n"; // penting untuk sinkronisasi bahasa global

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // --- STATE PERSISTEN ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem("refreshInterval");
    return saved ? parseInt(saved) : 10000;
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "id";
  });

  const [temperatureUnit, setTemperatureUnit] = useState(() => {
    const saved = localStorage.getItem("temperatureUnit");
    return saved || "celsius";
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("notificationsEnabled");
    return saved ? JSON.parse(saved) : true;
  });

  // --- EFEK UNTUK MODE GELAP ---
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // --- EFEK UNTUK REFRESH INTERVAL ---
  useEffect(() => {
    localStorage.setItem("refreshInterval", refreshInterval.toString());
  }, [refreshInterval]);

  // --- EFEK UNTUK BAHASA (sinkron ke i18n) ---
  useEffect(() => {
    localStorage.setItem("language", language);
    i18n.changeLanguage(language);
  }, [language]);

  // --- EFEK UNTUK UNIT SUHU & NOTIFIKASI ---
  useEffect(() => {
    localStorage.setItem("temperatureUnit", temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    localStorage.setItem(
      "notificationsEnabled",
      JSON.stringify(notificationsEnabled)
    );
  }, [notificationsEnabled]);

  // --- HANDLER ---
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const updateRefreshInterval = (interval) => {
    if (interval >= 5000 && interval <= 60000) {
      setRefreshInterval(interval);
    }
  };

  const resetSettings = () => {
    setIsDarkMode(false);
    setRefreshInterval(10000);
    setLanguage("id");
    setTemperatureUnit("celsius");
    setNotificationsEnabled(true);
    i18n.changeLanguage("id");
    localStorage.clear();
  };

  // --- VALUE YANG DIKIRIM KE SEMUA KOMPONEN ---
  const value = {
    isDarkMode,
    toggleDarkMode,
    refreshInterval,
    updateRefreshInterval,
    language,
    setLanguage,
    temperatureUnit,
    setTemperatureUnit,
    notificationsEnabled,
    setNotificationsEnabled,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};