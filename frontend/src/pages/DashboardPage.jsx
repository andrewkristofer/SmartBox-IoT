// src/pages/DashboardPage.jsx

import React, { useRef, useEffect, useState } from "react";
import SmartBoxDataDisplay from "../components/SmartBoxDataDisplay";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../services/api";
import { ListFilter, ChevronLeft, ChevronRight, PlusCircle, Trash2, ShieldAlert, Power, Eye, EyeOff } from "lucide-react"; 
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext"; 
import "../App.css";

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); 

  // --- STATE KHUSUS DEBUGGING (Hanya untuk Super Admin) ---
  const [simulateUser, setSimulateUser] = useState(false);

  // --- LOADING STATE ---
  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <h3>Memuat Data Pengguna...</h3>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{marginTop: 20, padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer'}}>
            Force Reset
        </button>
      </div>
    );
  }

  // --- 1. LOGIKA ROLE (STRICT) ---
  
  // HANYA role 'super_admin' yang dianggap DEWA.
  // Role 'admin' (Mitra) dianggap user biasa.
  const isSuperAdmin = user?.role === 'super_admin'; 

  // Mode Admin View aktif JIKA: Usernya Super Admin DAN Sedang tidak simulasi.
  // Mitra (admin biasa) akan SELALU mendapatkan nilai FALSE di sini.
  const isAdminView = isSuperAdmin && !simulateUser;

  // --- 2. LOGIKA KEAMANAN ---
  const isProtectedFleet = (id) => /^SMARTBOX-/i.test(id);

  const ACCESS_RULES = {
    'mitra_padang': ['SMARTBOX-001'], 
    'mitra_gudang': ['SMARTBOX-002', 'SMARTBOX-003'],
  };

  // --- 3. STATE ---
  const [serverBoxIds, setServerBoxIds] = useState([]);
  const [myDevices, setMyDevices] = useState(() => {
    const saved = localStorage.getItem("my_smartboxes");
    return saved ? JSON.parse(saved) : [];
  });

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRef = useRef(null);

  // --- 4. FETCH DATA (Hanya jika Admin View Aktif) ---
  useEffect(() => {
    if (isAdminView) {
      const fetchDevices = async () => {
        try {
          const ids = await apiFetch('/api/admin/devices');
          setServerBoxIds(ids);
        } catch (error) {
          // Fallback data
          setServerBoxIds(["SMARTBOX-001", "SMARTBOX-002", "SMARTBOX-003", "SMARTBOX-004", "SMARTBOX-005", "SMARTBOX-006"]); 
        }
      };
      fetchDevices();
    } else {
      // Jika Mitra (atau Super Admin yg lagi simulasi), data server dikosongkan!
      setServerBoxIds([]);
    }
  }, [isAdminView]);

  // --- 5. LOGIKA GABUNGAN ---
  let displayedBoxIds = [];

  if (isAdminView) {
    // Super Admin View: Server + Local
    displayedBoxIds = [...new Set([...serverBoxIds, ...myDevices])];
  } else {
    // Mitra View: Local Only
    displayedBoxIds = myDevices;
  }

  // --- 6. HANDLER ADD DEVICE ---
  const handleAddDevice = () => {
    const inputRaw = window.prompt("Masukkan ID Smartbox / Nama Dummy:");
    
    if (inputRaw) {
      const deviceId = inputRaw.trim(); 

      if (myDevices.includes(deviceId)) {
        toast.error("Alat ini sudah ada!");
        return;
      }

      // Security Check (Skip HANYA jika isAdminView aktif)
      if (!isAdminView && isProtectedFleet(deviceId)) {
        const allowedBoxes = ACCESS_RULES[user?.username] || [];
        if (!allowedBoxes.includes(deviceId)) {
          toast.error(`AKSES DITOLAK: Akun '${user.username}' tidak punya izin ke ${deviceId}`, { icon: '🔒' });
          return;
        }
      }
      
      const newDevices = [...myDevices, deviceId];
      setMyDevices(newDevices);
      localStorage.setItem("my_smartboxes", JSON.stringify(newDevices));
      toast.success(`Berhasil menambahkan: ${deviceId}`);
    }
  };

  const handleResetDevices = () => {
    if (window.confirm("Hapus list simulasi lokal Anda?")) {
      setMyDevices([]);
      localStorage.removeItem("my_smartboxes");
      toast.success("List lokal dibersihkan.");
    }
  };

  const handleHardReset = () => {
    if(window.confirm("RESET TOTAL? Ini akan logout akun.")) {
        localStorage.clear(); 
        window.location.href = '/login'; 
    }
  }

  // Observer & Pagination
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleSections((prev) => new Set([...prev, "dashboard"])); },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
    );
    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); observer.disconnect(); };
  }, []);

  const totalPages = Math.ceil(displayedBoxIds.length / itemsPerPage);
  if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBoxes = displayedBoxIds.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };
  const handleLimitChange = (e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };


  return (
    <section id="dashboard" ref={sectionRef} className={`section dashboard ${visibleSections.has("dashboard") ? "section-visible" : ""}`}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* --- HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{textAlign: 'left'}}>
            <h2 className={`section-title ${visibleSections.has("dashboard") ? "title-visible" : ""}`} style={{ margin: 0, fontSize: '2rem' }}>
                {isAdminView ? "Super Admin Monitor" : t("dashboard.operationalTitle")}
            </h2>
            
            {/* BADGE STATUS: Hanya muncul kalau Super Admin, biar Mitra gak bingung */}
            {isSuperAdmin && (
                 <div style={{ fontSize: '0.8rem', color: isAdminView ? '#4ade80' : '#fbbf24', marginTop: 5, fontWeight: 'bold' }}>
                    STATUS: {isAdminView ? `FULL ACCESS (${user.role})` : `SIMULATING MITRA`}
                </div>
            )}
            
            <div className="title-underline" style={{ left: 0, transform: 'none' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* --- TOMBOL AJAIB: VIEW AS USER --- */}
            {/* SYARAT KETAT: Hanya muncul jika user aslinya benar-benar 'super_admin' */}
            {isSuperAdmin && (
                <button 
                    onClick={() => setSimulateUser(!simulateUser)} 
                    style={{ 
                        background: simulateUser ? '#fbbf24' : '#334155', 
                        color: simulateUser ? 'black' : 'white', 
                        padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5, fontWeight: 'bold'
                    }}
                    title={simulateUser ? "Kembali ke Mode Admin" : "Simulasi Tampilan Mitra"}
                >
                    {simulateUser ? <EyeOff size={18}/> : <Eye size={18}/>}
                    {simulateUser ? "Exit Mitra Mode" : "View as Mitra"}
                </button>
            )}

            <button onClick={handleAddDevice} className="refresh-button" style={{ background: '#2563eb', color: 'white', borderColor: '#1d4ed8' }}>
                <PlusCircle size={18} /> Add
            </button>

            {myDevices.length > 0 && (
                <button onClick={handleResetDevices} className="refresh-button" style={{ background: '#ef4444', color: 'white', borderColor: '#b91c1c' }}>
                    <Trash2 size={18} />
                </button>
            )}

            {/* Pagination */}
            <div className="filter-control" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <ListFilter size={18} color="white" />
              <select value={itemsPerPage} onChange={handleLimitChange} style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                <option value={5}>5 / Page</option>
                <option value={100}>All</option>
              </select>
            </div>

            {/* Tombol Hard Reset */}
            <button onClick={handleHardReset} style={{ background: '#7f1d1d', color: 'white', border: '1px solid red', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '10px' }} title="LOGOUT & CLEAR">
                <Power size={20} />
            </button>

          </div>
        </div>

        {/* PESAN JIKA LIST KOSONG (MITRA) */}
        {!isAdminView && myDevices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.3)', color: '#cbd5e1' }}>
            <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Mode Privasi Aktif</h3>
            <p>Halo, <b>{user.username}</b>. Silakan tambahkan ID Smartbox Anda.</p>
          </div>
        )}

        <SmartBoxDataDisplay boxIds={currentBoxes} />
        
        {/* Pagination Controls */}
        {displayedBoxIds.length > itemsPerPage && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ background: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'white', color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : 'var(--primary-blue)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <ChevronLeft size={24} />
            </button>
            <span style={{ color: 'white', fontWeight: '600' }}>Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ background: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : 'white', color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : 'var(--primary-blue)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <ChevronRight size={24} />
            </button>
            </div>
        )}

      </div>
    </section>
  );
};

export default DashboardPage;