// src/pages/DashboardPage.jsx

import React, { useRef, useEffect, useState } from "react";
import SmartBoxDataDisplay from "../components/SmartBoxDataDisplay";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../services/api"; 
import { ListFilter, ChevronLeft, ChevronRight } from "lucide-react"; // Tambah ikon panah
import "../App.css";

const DashboardPage = () => {
  const { t } = useTranslation();
  
  const [allBoxIds, setAllBoxIds] = useState([]);
  
  // Ganti konsep 'Limit Total' menjadi 'Items Per Page'
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default 5 per halaman agar rapi
  const [currentPage, setCurrentPage] = useState(1);
  
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRef = useRef(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const ids = await apiFetch('/api/admin/devices');
        setAllBoxIds(ids);
      } catch (error) {
        console.error("Gagal mengambil daftar device:", error);
        setAllBoxIds(["SMARTBOX-001"]); 
      }
    };
    fetchDevices();
  }, []);

  // 2. Observer Animasi
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, "dashboard"]));
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );
    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, []);

  // --- LOGIKA PAGINATION ---
  
  // Hitung total halaman
  const totalPages = Math.ceil(allBoxIds.length / itemsPerPage);

  // Pastikan currentPage tidak melebihi totalPages (jika user ganti limit)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // Potong array sesuai halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBoxes = allBoxIds.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset ke halaman 1 setiap ganti limit
  };

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className={`section dashboard ${
        visibleSections.has("dashboard") ? "section-visible" : ""
      }`}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Dashboard */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2
            className={`section-title ${
              visibleSections.has("dashboard") ? "title-visible" : ""
            }`}
            style={{ margin: 0, textAlign: 'left', fontSize: '2rem' }}
          >
            {t("dashboard.operationalTitle")}
            <div className="title-underline" style={{ left: 0, transform: 'none' }}></div>
          </h2>

          {/* Kontrol Pagination (Items Per Page) */}
          <div className="filter-control" style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '0.5rem 1rem', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <ListFilter size={18} color="white" />
            <span style={{ color: 'white', fontSize: '0.9rem' }}>Show:</span>
            <select 
              value={itemsPerPage} 
              onChange={handleLimitChange}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              <option value={3}>3 / Page</option>
              <option value={5}>5 / Page</option>
              <option value={10}>10 / Page</option>
              <option value={100}>All Fleet</option>
            </select>
          </div>
        </div>

        {/* TAMPILKAN DATA (Hanya halaman saat ini) */}
        <SmartBoxDataDisplay boxIds={currentBoxes} />
        
        {/* --- TOMBOL NAVIGASI PAGINATION --- */}
        {allBoxIds.length > itemsPerPage && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: '2rem', 
            gap: '1rem' 
          }}>
            
            {/* Tombol Previous */}
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                background: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'white',
                color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : 'var(--primary-blue)',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '50%',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Info Halaman */}
            <span style={{ color: 'white', fontWeight: '600' }}>
              Page {currentPage} of {totalPages}
            </span>

            {/* Tombol Next */}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                background: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : 'white',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : 'var(--primary-blue)',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '50%',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <ChevronRight size={24} />
            </button>

          </div>
        )}

      </div>
    </section>
  );
};

export default DashboardPage;