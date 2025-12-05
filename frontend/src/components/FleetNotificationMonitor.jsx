// src/components/FleetNotificationMonitor.jsx

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getSmartBoxData } from '../services/api';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Pastikan file audio ada di folder public
const ALERT_SOUND_URL = "/alert.mp3"; 
const FLEET_IDS = ["SMARTBOX-001", "SMARTBOX-002", "SMARTBOX-003"];

const FleetNotificationMonitor = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  
  // PERBAIKAN: Gunakan useRef, bukan useState
  // Ref nilainya selalu update di dalam setInterval tanpa re-render
  const activeToastsRef = useRef({}); 
  
  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio(ALERT_SOUND_URL));

  const isDanger = (log) => {
    if (!log || !log.temperature || !log.humidity) return false;
    // Logika Bahaya
    const isTempSafe = log.temperature >= 1.0 && log.temperature <= 4.0;
    const isHumidSafe = log.humidity >= 20.0 && log.humidity <= 60.0;
    return !isTempSafe || !isHumidSafe;
  };

  const playAlert = () => {
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error("Gagal putar audio:", e));
    }
  };

  const checkFleets = async () => {
    // Jangan lanjut jika tidak login
    if (!isAuthenticated) return;

    for (const boxId of FLEET_IDS) {
      try {
        const data = await getSmartBoxData(boxId, 1);
        const latestLog = data[0];

        // ------------------------------------------
        // KASUS 1: KONDISI BAHAYA
        // ------------------------------------------
        if (latestLog && isDanger(latestLog)) {
          
          // Cek via Ref: Apakah notifikasi SUDAH ada?
          if (!activeToastsRef.current[boxId]) {
            
            // 1. Bunyikan Audio
            playAlert();

            // 2. Munculkan Toast
            const toastId = toast.custom((tInstance) => (
              <div
                className={`${
                  tInstance.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                style={{ borderLeft: '6px solid #ef4444', maxWidth: '300px' }}
                onClick={() => {
                   // User klik manual -> Hapus Toast & Hapus dari Ref
                   toast.dismiss(tInstance.id);
                   delete activeToastsRef.current[boxId];
                }}
              >
                <div className="flex-1 w-0 p-4 cursor-pointer">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {t('status.danger', 'BAHAYA!')} - {boxId}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Temp: {latestLog.temperature}°C | Hum: {latestLog.humidity}%
                      </p>
                      <p className="mt-2 text-xs text-red-400 font-bold">
                        {t('notification.clickToDismiss', 'Klik untuk menutup')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ), {
              duration: Infinity, 
              position: 'bottom-left',
              id: `danger-${boxId}`,
            });

            // 3. Simpan ID toast ke Ref (Sync langsung)
            activeToastsRef.current[boxId] = toastId;
            console.log(`[Monitor] Notifikasi Bahaya Dibuat: ${boxId}`);
          }
        } 
        // ------------------------------------------
        // KASUS 2: KONDISI AMAN (ATAU DATA TIDAK VALID)
        // ------------------------------------------
        else {
          // Cek via Ref: Apakah ada notifikasi yang sedang aktif untuk box ini?
          if (activeToastsRef.current[boxId]) {
            
            console.log(`[Monitor] Kondisi Aman. Menghapus notifikasi: ${boxId}`);
            
            // 1. Hapus Toast dari layar
            toast.dismiss(activeToastsRef.current[boxId]);
            
            // 2. Hapus dari Ref agar status kembali bersih
            delete activeToastsRef.current[boxId];
          }
        }

      } catch (error) {
        // Jangan spam console error di production, cukup sekali-sekali
        // console.error(`Error monitoring ${boxId}`, error);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
        // Jalankan sekali saat mount
        checkFleets();
        
        // Setup Interval
        intervalRef.current = setInterval(() => {
            checkFleets();
        }, 5000); // Cek lebih sering (5 detik) agar responsif saat kembali Aman
    } else {
        // Jika logout, bersihkan semua
        toast.dismiss(); 
        activeToastsRef.current = {};
    }

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated]);

  return null;
};

export default FleetNotificationMonitor;