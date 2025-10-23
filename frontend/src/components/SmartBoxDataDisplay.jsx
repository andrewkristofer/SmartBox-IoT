// src/components/SmartBoxDataDisplay.jsx (Jika Anda buat file terpisah)
// ATAU letakkan definisi ini di dalam src/pages/DashboardPage.jsx sebelum 'export default'

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext'; // Pastikan path ini benar
import { Thermometer, Droplets, MapPin, Clock } from 'lucide-react';
import '../App.css'; // Atau CSS spesifik jika ada

const SmartBoxDataDisplay = () => {
  const { t } = useTranslation();
  const [smartBoxData, setSmartBoxData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Untuk animasi container
  const containerRef = useRef(null);
  // Ambil pengaturan dari context
  const { refreshInterval, temperatureUnit } = useSettings();

  const boxIdToFetch = "SMARTBOX-001";

  // Fungsi konversi suhu
  const convertTemperature = (celsius) => {
    if (temperatureUnit === "fahrenheit") {
      return (celsius * 9) / 5 + 32;
    }
    return celsius;
  };

  // Fungsi mendapatkan unit suhu
  const getTemperatureUnit = () => {
    return temperatureUnit === "fahrenheit" ? "°F" : "°C";
  };

  // Fungsi menentukan status log
  const getLogStatus = (log) => {
    if (
      !log ||
      typeof log.temperature !== "number" ||
      typeof log.humidity !== "number"
    ) {
      return { text: "N/A", className: "status-unknown" };
    }
    const isTempSafe = log.temperature >= 1.0 && log.temperature <= 4.0;
    const isHumidSafe = log.humidity >= 40.0 && log.humidity <= 60.0;

    if (isTempSafe && isHumidSafe) {
      // Gunakan t() untuk teks status jika Anda ingin menerjemahkannya
      return { text: t('status.safe', 'Aman'), className: "status-safe" };
    } else {
      return { text: t('status.danger', 'Bahaya'), className: "status-danger" };
    }
  };

  // Effect untuk Intersection Observer (animasi container)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 } // Muncul saat 20% terlihat
    );

    const currentRef = containerRef.current; // Salin ref ke variabel
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup observer
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
       observer.disconnect();
    };
  }, []); // Hanya dijalankan saat mount

  // Effect untuk mengambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      // Jangan set isLoading true jika hanya refresh
      // setIsLoading(true); // Mungkin bisa dihapus jika tidak ingin loading indicator setiap refresh
      setError(null);
      try {
        const response = await fetch(
          // Sesuaikan URL jika endpoint backend berubah
          `http://localhost:5000/api/data/${boxIdToFetch}?limit=6`
        );
        if (!response.ok) {
          // Coba parse error dari backend jika ada
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (parseError) {
             // Biarkan errorMsg default jika response bukan JSON
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setSmartBoxData(data);
      } catch (e) {
        console.error("Fetch error:", e);
        // Pesan error lebih deskriptif
        const message = e.message.includes("Failed to fetch") || e.message.includes("NetworkError")
          ? t("errors.connectionRefused") // Pesan jika server tidak bisa dijangkau
          : t("errors.backendFetch", { details: e.message }); // Pesan jika error lain dari backend
        setError(message);
      } finally {
         // Set isLoading false hanya saat pengambilan data pertama kali selesai
         if (isLoading) setIsLoading(false);
      }
    };

    fetchData(); // Ambil data saat komponen mount
    const interval = setInterval(fetchData, refreshInterval); // Atur interval refresh

    // Cleanup interval saat komponen unmount
    return () => clearInterval(interval);
     // Tambahkan isLoading ke dependency array agar fetchData dipanggil ulang saat isLoading berubah (jika diperlukan)
     // Hapus isLoading jika tidak ingin fetchData terpanggil ulang saat isLoading berubah
  }, [boxIdToFetch, refreshInterval, t, isLoading]); // Tambahkan t ke dependencies jika digunakan di pesan error

  return (
    <div
      ref={containerRef}
      // Terapkan class 'visible' berdasarkan state isVisible
      className={`live-data-container ${isVisible ? "visible" : ""}`}
    >
      <h3 className="live-data-title">
        {t('dashboard.liveFeedTitle', { boxId: boxIdToFetch })} {/* Gunakan t() */}
        <div className="live-indicator"></div>
      </h3>

      {/* Tampilkan loading hanya saat pertama kali load */}
      {isLoading && <p>{t('loading', 'Loading data...')}</p>}

      {/* Tampilkan pesan error jika ada */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Tampilkan data jika tidak loading, tidak error, dan ada data */}
      {!isLoading && !error && smartBoxData.length > 0 && (
        <div className="data-cards-grid">
          {smartBoxData.map((log, index) => {
            const status = getLogStatus(log);
            // URL Google Maps (pastikan format latitude/longitude benar)
            const gmapsUrl = (log.latitude && log.longitude)
              ? `https://www.google.com/maps?q=${log.latitude},${log.longitude}`
              : "#"; // Link non-aktif jika lat/lon tidak valid

            return (
              <div
                key={log.id || `log-${index}`} // Gunakan index sebagai fallback key
                className={`data-card ${isVisible ? "visible" : ""}`} // Animasi card
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`status-indicator ${status.className}`}>
                  {status.text}
                </div>

                <div className="data-item">
                  <Clock size={16} />
                  <span>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString("id-ID") : t('na', 'N/A')}
                  </span>
                </div>
                <div className="data-item">
                  <Thermometer size={16} />
                  <span>
                    {typeof log.temperature === 'number'
                      ? `${convertTemperature(log.temperature).toFixed(2)} ${getTemperatureUnit()}`
                      : t('na', 'N/A')}
                  </span>
                </div>
                <div className="data-item">
                  <Droplets size={16} />
                  <span>
                    {typeof log.humidity === 'number'
                      ? `${log.humidity.toFixed(2)} %`
                      : t('na', 'N/A')}
                  </span>
                </div>

                <a
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`data-item-link ${!(log.latitude && log.longitude) ? 'disabled-link' : ''}`} // Tambah class jika link non-aktif
                >
                  <div className="data-item">
                    <MapPin size={16} />
                    <span>
                      {log.latitude && log.longitude
                        ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}`
                        : t('location.unavailable', 'Lokasi tidak tersedia')}
                    </span>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Tampilkan pesan jika tidak loading, tidak error, tapi tidak ada data */}
      {!isLoading && !error && smartBoxData.length === 0 && (
        <p>{t("errors.noData")}</p>
      )}
    </div>
  );
};

// Jika Anda membuat file terpisah, tambahkan baris ini:
export default SmartBoxDataDisplay;