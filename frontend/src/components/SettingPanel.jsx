import { useState } from "react";
import {
  Settings,
  X,
  Moon,
  Sun,
  RefreshCw,
  Globe,
  Thermometer,
  Bell,
  RotateCcw,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import "./SettingPanel.css";

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
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
    resetSettings,
  } = useSettings();

  const handleRefreshIntervalChange = (e) => {
    updateRefreshInterval(parseInt(e.target.value));
  };

  // ganti bahasa langsung sinkron ke i18n
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
  };

  const handleReset = () => {
    if (window.confirm(t("settings.confirmReset"))) {
      resetSettings();
      i18n.changeLanguage("id"); // kembali ke default bahasa
    }
  };

  return (
    <>
      <button
        className="settings-trigger"
        onClick={() => setIsOpen(true)}
        aria-label={t("settings.openSettings")}
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="settings-overlay" onClick={() => setIsOpen(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>{t("settings.title")}</h2>
              <button
                className="settings-close"
                onClick={() => setIsOpen(false)}
                aria-label={t("settings.close")}
              >
                <X size={24} />
              </button>
            </div>

            <div className="settings-content">
              {/* MODE + NOTIF */}
              <div className="setting-group">
                <div className="setting-item">
                  <div className="setting-label">
                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{t("settings.darkMode")}</span>
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
                    <span>{t("settings.notifications")}</span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) =>
                        setNotificationsEnabled(e.target.checked)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* DISPLAY PREFS */}
              <div className="setting-group">
                <h3>{t("settings.displayPrefs")}</h3>

                <div className="setting-item-vertical">
                  <div className="setting-label">
                    <Globe size={20} />
                    <span>{t("settings.language")}</span>
                  </div>
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="setting-select"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="setting-item-vertical">
                  <div className="setting-label">
                    <Thermometer size={20} />
                    <span>{t("settings.tempUnit")}</span>
                  </div>
                  <select
                    value={temperatureUnit}
                    onChange={(e) => setTemperatureUnit(e.target.value)}
                    className="setting-select"
                  >
                    <option value="celsius">{t("settings.celsius")}</option>
                    <option value="fahrenheit">{t("settings.fahrenheit")}</option>
                  </select>
                </div>
              </div>

              {/* DATA REFRESH */}
              <div className="setting-group">
                <h3>{t("settings.dataUpdate")}</h3>

                <div className="setting-item-vertical">
                  <div className="setting-label">
                    <RefreshCw size={20} />
                    <span>{t("settings.refreshInterval")}</span>
                    <span className="setting-value">
                      {refreshInterval / 1000}s
                    </span>
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

              {/* RESET BUTTON */}
              <div className="setting-group">
                <button className="reset-button" onClick={handleReset}>
                  <RotateCcw size={18} />
                  {t("settings.reset")}
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