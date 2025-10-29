// src/pages/DashboardPage.jsx

import React, { useRef, useEffect, useState } from "react"; // Hapus state/effect yang tidak perlu
import SmartBoxDataDisplay from "../components/SmartBoxDataDisplay";
import { useTranslation } from "react-i18next";
import "../App.css";

// Tentukan ID armada yang ingin kita pantau.
// Nanti, daftar ini bisa diambil dari database, tapi untuk sekarang,
// kita hardcode di frontend.
const FLEET_IDS = ["SMARTBOX-001", "SMARTBOX-002", "SMARTBOX-003"];

const DashboardPage = () => {
  const { t } = useTranslation();
  
  // Hapus semua state dan effect yang terkait 'dashboardStats' dan 'animateDashboard'
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRef = useRef(null);

  // Effect ini hanya untuk animasi section-title, jadi kita biarkan
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, "dashboard"]));
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

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className={`section dashboard ${
        visibleSections.has("dashboard") ? "section-visible" : ""
      }`}
    >
      <h2
        className={`section-title ${
          visibleSections.has("dashboard") ? "title-visible" : ""
        }`}
      >
        {/* Gunakan key i18n baru (akan kita tambahkan di langkah 2) */}
        {t("dashboard.operationalTitle")}
        <div className="title-underline"></div>
      </h2>

      {/* HAPUS SEMUA DIV "stats-grid" DARI SINI */}

      {/* Ganti komponen ini menjadi tabel status armada */}
      <SmartBoxDataDisplay boxIds={FLEET_IDS} />
    </section>
  );
};

export default DashboardPage;