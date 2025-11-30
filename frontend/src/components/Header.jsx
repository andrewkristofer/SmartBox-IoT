// src/components/Header.jsx

import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SmartBoxLogo from "../assets/smartboxiotlogo.png"; 
// Tambahkan ikon ShieldCheck untuk Admin
import { Menu, X, LogIn, LogOut, Home, ShieldCheck } from "lucide-react"; 
import { AuthContext } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import "../App.css"; 

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  
  // 1. Ambil currentUser dari Context
  const { isAuthenticated, logout, currentUser } = useContext(AuthContext); 
  
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    if (window.location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login");
    setIsMenuOpen(false);
  };

  // --- LOGIKA UTAMA: Cek apakah user adalah Super Admin ---
  const isSuperAdmin = currentUser?.role === 'super_admin';

  let navItems = [];
  
  // A. Jika di Dashboard (User biasa / Admin lihat dashboard)
  if (location.pathname.startsWith('/dashboard')) {
    navItems = [
      { id: "home", label: t("header.nav.home", "Home"), isPageLink: true, path: "/" },
      // Tampilkan tombol Admin JIKA Super Admin
      ...(isSuperAdmin ? [{ id: "admin", label: t("header.nav.admin"), isPageLink: true, path: "/admin" }] : [])
    ];
  } 
  
  // B. Jika di Halaman Admin (Khusus Super Admin)
  else if (location.pathname.startsWith('/admin')) {
    navItems = [
      { id: "home", label: t("header.nav.home", "Home"), isPageLink: true, path: "/" },
      // Super admin mungkin mau lihat dashboard monitoring biasa juga
      { id: "dashboard", label: t("header.nav.dashboard"), isPageLink: true, path: "/dashboard" }
    ];
  }

  // C. Jika di Landing Page
  else if (location.pathname === '/') {
     navItems = [
       { id: "home", label: t("header.nav.what"), isScrollLink: true }, 
       { id: "program", label: t("header.nav.why"), isScrollLink: true },
       { id: "nutrition", label: t("header.nav.how"), isScrollLink: true },
       
       // Tampilkan tombol Admin JIKA Super Admin
       ...(isAuthenticated && isSuperAdmin ? [{ id: "admin", label: t("header.nav.admin"), isPageLink: true, path: "/admin" }] : []),
       
       // Tampilkan link ke Dashboard jika login (semua user login bisa lihat dashboard)
       ...(isAuthenticated ? [{ id: "dashboard", label: t("header.nav.dashboard"), isPageLink: true, path: "/dashboard" }] : [])
     ];
  }
  
  // D. Halaman Login/Signup
  else if (['/login', '/signup', '/waiting-approval'].includes(location.pathname)) {
    navItems = [
       { id: "home", label: t("header.nav.home", "Home"), isPageLink: true, path: "/" }
    ];
  }

 return (
    <header className={`header ${isHeaderScrolled ? "scrolled" : ""}`}>
      <nav className="nav">
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <span>Smart Box IoT</span>
          <img src={SmartBoxLogo} alt="Smart Box IoT Logo" className="logo-icon" />
        </Link>

        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          
          {navItems.map((item) => (
             <li key={item.id}>
              {item.isPageLink ? (
                <Link to={item.path} onClick={() => setIsMenuOpen(false)} className="nav-button-style">
                  
                  {/* Ikon Home */}
                  {item.id === 'home' && <Home size={16} style={{ marginRight: '6px' }} />} 
                  
                  {/* Ikon Admin (BARU) - Biar terlihat beda dan eksklusif */}
                  {item.id === 'admin' && <ShieldCheck size={16} style={{ marginRight: '6px', color: '#fbbf24' }} />}
                  
                  {item.label}
                </Link>
              ) : (
                <button onClick={() => scrollToSection(item.id)}>
                  {item.label}
                </button>
              )}
            </li>
          ))}

           <li>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="auth-button logout-button">
                <LogOut size={16} /> {t("header.nav.logout", "Logout")}
              </button>
            ) : (
              !['/login', '/signup'].includes(location.pathname) && (
                <button onClick={handleLogin} className="auth-button">
                   <LogIn size={16} /> {t("header.nav.login", "Login")}
                </button>
              )
            )}
          </li>
        </ul>

        <button className="mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>
    </header>
  );
};

export default Header;