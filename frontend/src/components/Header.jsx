// src/components/Header.jsx

import { useState, useEffect, useContext } from "react";
// Impor useLocation untuk mendeteksi halaman saat ini
import { Link, useNavigate, useLocation } from "react-router-dom";
import SmartBoxLogo from "../assets/smartboxiotlogo.png"; //
// Impor ikon Home
import { Menu, X, LogIn, LogOut, Home } from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import "../App.css"; //

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // <-- BARU: Dapatkan lokasi saat ini

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

  // --- LOGIKA NAVIGASI BARU ---
  // Definisikan navItems berdasarkan halaman saat ini
  let navItems = [];
  
  // Jika kita di dashboard...
  if (location.pathname.startsWith('/dashboard')) {
    navItems = [
      // Kita hanya tampilkan tombol "Home" untuk kembali ke landing page
      { id: "home", label: t("header.nav.home", "Home"), isPageLink: true, path: "/" }
    ];
  } 
  // Jika kita di landing page...
  else if (location.pathname === '/') {
     navItems = [
       { id: "home", label: t("header.nav.what"), isScrollLink: true }, 
       { id: "program", label: t("header.nav.why"), isScrollLink: true },
       { id: "nutrition", label: t("header.nav.how"), isScrollLink: true },
       // Tampilkan link ke Dashboard jika login
       ...(isAuthenticated ? [{ id: "dashboard", label: t("header.nav.dashboard"), isPageLink: true, path: "/dashboard" }] : [])
     ];
  }
  else if (['/login', '/signup'].includes(location.pathname)) {
    // Tampilkan tombol Home jika di halaman Login atau Signup
    navItems = [
       { id: "home", label: t("header.nav.home", "Home"), isPageLink: true, path: "/" }
    ];
  }
  // Jika di halaman lain (login/signup), navItems akan kosong (tidak menampilkan apa-apa)
  // --- AKHIR LOGIKA NAVIGASI BARU ---


 return (
    <header className={`header ${isHeaderScrolled ? "scrolled" : ""}`}>
      <nav className="nav">
        <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)}>
          <span>Smart Box IoT</span>
          <img src={SmartBoxLogo} alt="Smart Box IoT Logo" className="logo-icon" />
        </Link>

        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          
          {/* --- KODE RENDER YANG SEBELUMNYA HILANG --- */}
          {navItems.map((item) => (
             <li key={item.id}>
              {item.isPageLink ? (
                // Ini untuk link antar halaman (misal: ke /dashboard atau /)
                <Link to={item.path} onClick={() => setIsMenuOpen(false)} className="nav-button-style">
                  {/* Tampilkan ikon Home jika id-nya 'home' */}
                  {item.id === 'home' && <Home size={16} style={{ marginRight: '4px' }} />} 
                  {item.label}
                </Link>
              ) : (
                // Ini untuk tombol scroll di landing page
                <button onClick={() => scrollToSection(item.id)}>
                  {item.label}
                </button>
              )}
            </li>
          ))}
          {/* --- AKHIR KODE RENDER --- */}

           <li>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="auth-button logout-button">
                <LogOut size={16} /> {t("header.nav.logout", "Logout")}
              </button>
            ) : (
              // Sembunyikan tombol login jika kita sudah di halaman login/signup
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