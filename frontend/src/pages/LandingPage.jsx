import React, { useRef, useState, useEffect } from "react";
// Impor ikon yang dibutuhkan untuk section ini
import { Heart, Users, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../App.css"; // Impor CSS utama

const LandingPage = () => {
  const { t } = useTranslation();
  // State dan Ref untuk animasi scroll/intersection observer section
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionsRef = useRef({});

  // Effect untuk Intersection Observer (jika masih diperlukan di sini)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          } else {
            // Opsional: hapus jika keluar viewport
            setVisibleSections((prev) => {
              const newSet = new Set(prev);
              newSet.delete(entry.target.id);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );

    // Amati semua section yang memiliki ref
    Object.values(sectionsRef.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Cleanup observer saat komponen unmount
    return () => observer.disconnect();
  }, []); // Hanya dijalankan sekali saat mount

  return (
    // Anda bisa gunakan div pembungkus atau React Fragment (<> </>)
    <>
      {/* Hero Section - Ambil dari App.jsx lama */}
      <section
        id="home"
        ref={(el) => (sectionsRef.current.home = el)}
        className="hero"
      >
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1 className="animate-slide-up">Smart Box IoT</h1>
          <div className="tagline animate-slide-up delay-200">
            {t("hero.tagline")}
          </div>
          <p className="animate-slide-up delay-400">{t("hero.description")}</p>
        </div>
      </section>

      {/* Program Section (Why) - Ambil dari App.jsx lama */}
      <section
        id="program"
        ref={(el) => (sectionsRef.current.program = el)}
        className={`section program ${
          visibleSections.has("program") ? "section-visible" : ""
        }`}
      >
        <h2
          className={`section-title ${
            visibleSections.has("program") ? "title-visible" : ""
          }`}
        >
          {t("program.title")}
          <div className="title-underline"></div>
        </h2>

        <div className="info-grid">
          {[
            {
              icon: <Heart />,
              title: t("program.monitoring.title"),
              content: t("program.monitoring.desc"),
            },
            {
              icon: <Users />,
              title: t("program.connected.title"),
              content: t("program.connected.desc"),
            },
            {
              icon: <Leaf />, // Tetap Leaf atau ikon lain yang sesuai
              title: t("program.responsive.title"),
              content: t("program.responsive.desc"),
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`info-card ${
                visibleSections.has("program") ? "visible" : ""
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nutrition Section (How) - Ambil dari App.jsx lama */}
      <section
        id="nutrition"
        ref={(el) => (sectionsRef.current.nutrition = el)}
        className={`section nutrition ${
          visibleSections.has("nutrition") ? "section-visible" : ""
        }`}
      >
        <h2
          className={`section-title ${
            visibleSections.has("nutrition") ? "title-visible" : ""
          }`}
        >
          {t("nutrition.title")}
          <div className="title-underline"></div>
        </h2>

        <div className="features-grid">
          {[
            {
              emoji: "📦",
              title: t("nutrition.quality.title"),
              desc: t("nutrition.quality.desc"),
            },
            {
              emoji: "🛡️",
              title: t("nutrition.safety.title"),
              desc: t("nutrition.safety.desc"),
            },
            {
              emoji: "🚚",
              title: t("nutrition.efficiency.title"),
              desc: t("nutrition.efficiency.desc"),
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`feature-card ${
                visibleSections.has("nutrition") ? "visible" : ""
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="feature-emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer tidak perlu di sini karena sudah dipisah ke komponen Footer.jsx */}
    </>
  );
};

export default LandingPage;