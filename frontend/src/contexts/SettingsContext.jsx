import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem('refreshInterval');
    return saved ? parseInt(saved) : 10000;
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'id';
  });

  const [temperatureUnit, setTemperatureUnit] = useState(() => {
    const saved = localStorage.getItem('temperatureUnit');
    return saved || 'celsius';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('refreshInterval', refreshInterval.toString());
  }, [refreshInterval]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('temperatureUnit', temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const updateRefreshInterval = (interval) => {
    if (interval >= 5000 && interval <= 60000) {
      setRefreshInterval(interval);
    }
  };

  const resetSettings = () => {
    setIsDarkMode(false);
    setRefreshInterval(10000);
    setLanguage('id');
    setTemperatureUnit('celsius');
    setNotificationsEnabled(true);
  };

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
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
