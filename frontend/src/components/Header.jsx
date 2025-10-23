// src/components/Header.jsx

import { useState, useEffect, useContext } from "react"; // Tambahkan useContext
import { Link, useNavigate } from "react-router-dom"; // Impor Link dan useNavigate
import SmartBoxLogo from "../assets/smartboxiotlogo.png"; // Sesuaikan path jika perlu
import { Menu, X, LogIn, LogOut } from "lucide-react"; // Impor ikon Login/Logout
import { AuthContext } from "../contexts/AuthContext"; // Impor AuthContext
import { useTranslation } from "react-i18next";
import "../App.css"; // Impor CSS utama (atau buat CSS khusus Header jika mau)

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext); // Dapatkan status login & fungsi logout
  const navigate = useNavigate(); // Hook untuk navigasi programatik

  // Effect untuk mendeteksi scroll dan mengubah tampilan header
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi untuk scroll ke section (berguna jika di LandingPage)
  // Anda mungkin perlu cara berbeda jika Header digunakan di halaman lain
  const scrollToSection = (sectionId) => {
    // Jika kita di halaman utama, scroll ke section
    if (window.location.pathname === "/") {
      const element = document.getElementById(sectionId); // Cari elemen berdasarkan ID
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Jika di halaman lain, navigasi ke halaman utama + hash
      navigate(`/#${sectionId}`);
    }
    setIsMenuOpen(false); // Tutup menu mobile setelah klik
  };

  const handleLogout = () => {
    logout(); // Panggil fungsi logout dari context
    navigate("/login"); // Arahkan ke halaman login setelah logout
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login"); // Arahkan ke halaman login
    setIsMenuOpen(false);
  };

  // Definisikan item navigasi
  const navItems = [
    { id: "home", label: t("header.nav.what") }, // Gunakan t() untuk label
    { id: "program", label: t("header.nav.why") },
    { id: "nutrition", label: t("header.nav.how") },
    // Link ke Dashboard hanya muncul jika sudah login
    ...(isAuthenticated ? [{ id: "dashboard", label: t("header.nav.dashboard"), isPageLink: true }] : [])
  ];

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
              {/* ... (render Link atau button) ... */}
            </li>
          ))}
           {/* 👇 Tombol Login/Logout Conditional berdasarkan isAuthenticated */}
           <li>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="auth-button logout-button">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <button onClick={handleLogin} className="auth-button login-button">
                 <LogIn size={16} /> Login
              </button>
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