import React, { useState, useEffect, useRef } from "react";
// Impor ikon yang dibutuhkan untuk section ini
import { Heart, Users, Leaf, Award } from "lucide-react";
// Impor komponen SmartBoxDataDisplay (jika Anda memisahkannya nanti)
// Jika tidak, definisikan di dalam file ini
import SmartBoxDataDisplay from "../components/SmartBoxDataDisplay"; // Asumsi dipindah ke components
import { useTranslation } from "react-i18next";
import "../App.css"; // Impor CSS utama

const DashboardPage = () => {
  const { t } = useTranslation();
  // State dan Ref untuk animasi dashboard
  const [visibleSections, setVisibleSections] = useState(new Set()); // Untuk animasi section jika perlu
  const [dashboardStats, setDashboardStats] = useState({
    mealsProvided: 0,
    co2Saved: 0,
    peopleHelped: 0,
    volunteers: 0,
  });
  const sectionRef = useRef(null); // Ref untuk section dashboard

  // Animate dashboard counters (diambil dari App.jsx lama)
  const animateDashboard = () => {
    const targets = {
      mealsProvided: 12847,
      co2Saved: 892,
      peopleHelped: 5432,
      volunteers: 234,
    };

    Object.entries(targets).forEach(([key, target]) => {
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setDashboardStats((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 16);
    });
  };

  // Effect untuk Intersection Observer (untuk memicu animasi counter saat terlihat)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, "dashboard"])); // Tandai section terlihat
          animateDashboard(); // Panggil animasi saat section terlihat
          // observer.unobserve(entry.target); // Opsional: Hentikan observasi setelah animasi berjalan
        } else {
          setVisibleSections((prev) => {
             const newSet = new Set(prev);
             newSet.delete("dashboard");
             return newSet;
          });
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
       observer.disconnect(); // Pastikan disconnect
    };
  }, []); // Hanya dijalankan sekali saat mount

  return (
    // Gunakan <section> sebagai elemen utama halaman dashboard
    <section
      id="dashboard" // ID ini mungkin tidak diperlukan lagi untuk scroll, tapi bisa untuk styling/animasi
      ref={sectionRef} // Tambahkan ref di sini
      className={`section dashboard ${
         // Tambahkan class visible jika perlu untuk animasi section
        visibleSections.has("dashboard") ? "section-visible" : ""
      }`}
    >
      <h2
        className={`section-title ${
          // Tambahkan class visible jika perlu untuk animasi judul
          visibleSections.has("dashboard") ? "title-visible" : ""
        }`}
      >
        {t("dashboard.title")}
        <div className="title-underline"></div>
      </h2>

      {/* Stats Grid - Ambil dari App.jsx lama */}
      <div className="stats-grid">
        {[
          { key: "mealsProvided", label: t("dashboard.stats.meals"), icon: <Heart /> },
          { key: "co2Saved", label: t("dashboard.stats.co2"), icon: <Leaf /> },
          { key: "peopleHelped", label: t("dashboard.stats.people"), icon: <Users /> },
          { key: "volunteers", label: t("dashboard.stats.volunteers"), icon: <Award /> },
        ].map((stat, index) => (
          <div
            key={stat.key}
            // Gunakan state visibleSections untuk class 'visible' pada stat-card
            className={`stat-card ${visibleSections.has("dashboard") ? "visible" : ""}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-number">
              {dashboardStats[stat.key].toLocaleString("id-ID")}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Komponen Live Data Feed */}
      {/* Jika Anda belum memindahkannya ke components/, salin kodenya ke sini */}
      <SmartBoxDataDisplay />

      {/* Tombol Logout bisa ditambahkan di sini atau di Header */}
      {/* Contoh:
         <button onClick={logout} style={{ marginTop: '2rem' }}>Logout</button>
         (Anda perlu import useAuth dan panggil const { logout } = useAuth(); )
       */}
    </section>
  );
};

// --- Definisi SmartBoxDataDisplay ---
// Anda bisa menaruh definisi komponen SmartBoxDataDisplay di sini
// ATAU memindahkannya ke file terpisah (misal: src/components/SmartBoxDataDisplay.jsx)
// dan mengimpornya di atas.
// Jika ditaruh di sini:


export default DashboardPage;