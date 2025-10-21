import { useState } from 'react';
import { Settings, X, Moon, Sun, RefreshCw, Globe, Thermometer, Bell, RotateCcw } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import './SettingsPanel.css';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
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
  } = useSettings();

  const handleRefreshIntervalChange = (e) => {
    updateRefreshInterval(parseInt(e.target.value));
  };

  const handleReset = () => {
    if (window.confirm('Reset semua pengaturan ke default?')) {
      resetSettings();
    }
  };

  return (
    <>
      <button
        className="settings-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open Settings"
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="settings-overlay" onClick={() => setIsOpen(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>Pengaturan</h2>
              <button
                className="settings-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close Settings"
              >
                <X size={24} />
              </button>
            </div>

            <div className="settings-content">
              <div className="setting-group">
                <div className="setting-item">
                  <div className="setting-label">
                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    <span>Mode Gelap</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={toggleDarkMode}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-label">
                    <Bell size={20} />
                    <span>Notifikasi</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h3>Preferensi Tampilan</h3>

                <div className="setting-item-vertical">
                  <div className="setting-label">
                    <Globe size={20} />
                    <span>Bahasa</span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="setting-select"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="setting-item-vertical">
                  <div className="setting-label">
                    <Thermometer size={20} />
                    <span>Unit Suhu</span>
                  </div>
                  <select
                    value={temperatureUnit}
                    onChange={(e) => setTemperatureUnit(e.target.value)}
                    className="setting-select"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h3>Pembaruan Data</h3>

                <div className="setting-item-vertical">
                  <div className="setting-label">
                    <RefreshCw size={20} />
                    <span>Interval Refresh</span>
                    <span className="setting-value">{refreshInterval / 1000}s</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="60000"
                    step="5000"
                    value={refreshInterval}
                    onChange={handleRefreshIntervalChange}
                    className="setting-slider"
                  />
                  <div className="slider-labels">
                    <span>5s</span>
                    <span>30s</span>
                    <span>60s</span>
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <button
                  className="reset-button"
                  onClick={handleReset}
                >
                  <RotateCcw size={18} />
                  Reset ke Default
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;
