// src/components/Footer.jsx

import React from "react";
import { useNavigate } from "react-router-dom"; // Impor useNavigate
import { useTranslation } from "react-i18next";
import "../App.css"; // Impor CSS utama

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Hook untuk navigasi

  // Fungsi scroll, mirip dengan di Header
  const scrollToSection = (sectionId) => {
    // Footer hanya ada di '/', jadi kita bisa asumsikan selalu scroll
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Fallback jika elemen tidak ditemukan (seharusnya tidak terjadi di landing page)
      navigate(`/#${sectionId}`);
    }
  };

   // Definisikan item footer
   const footerItems = [
    { id: "home", label: t("footer.home") },
    { id: "program", label: t("footer.program") },
    { id: "nutrition", label: t("footer.nutrition") },
    // Dashboard tidak perlu di footer umum
    // { id: "dashboard", label: t("footer.dashboard") },
  ];

  return (
    <footer className="footer">
      <div className="footer-links">
        {footerItems.map((item) => (
          <button key={item.id} onClick={() => scrollToSection(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <p>{t("footer.copyright")}</p>
    </footer>
  );
};

export default Footer;