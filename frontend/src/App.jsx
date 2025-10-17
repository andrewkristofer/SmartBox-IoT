import { useState, useEffect, useRef } from 'react';
import SmartBoxLogo from './assets/smartboxiotlogo.png'; // Pastikan path-nya benar
import { Menu, X, Leaf, Heart, Users, Award, Thermometer, Droplets, MapPin, Clock } from 'lucide-react';
import './App.css';

const SmartBoxDataDisplay = () => {
  const [smartBoxData, setSmartBoxData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  const boxIdToFetch = 'SMARTBOX-001';

  const getLogStatus = (log) => {
    if (!log || typeof log.temperature !== 'number' || typeof log.humidity !== 'number') {
      return { text: 'N/A', className: 'status-unknown' };
    }
    
    const isTempSafe = log.temperature >= 1.0 && log.temperature <= 4.0;
    const isHumidSafe = log.humidity >= 40.0 && log.humidity <= 60.0;

    if (isTempSafe && isHumidSafe) {
      return { text: 'Aman', className: 'status-safe' };
    } else {
      return { text: 'Bahaya', className: 'status-danger' };
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/data/${boxIdToFetch}?limit=6`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSmartBoxData(data);
      } catch (e) {
        setError("Gagal mengambil data dari backend. Pastikan server backend berjalan.");
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [boxIdToFetch]);

  return (
    <div ref={containerRef} className={`live-data-container ${isVisible ? 'visible' : ''}`}>
      <h3 className="live-data-title">
        Live Data Feed (ID: {boxIdToFetch})
        <div className="live-indicator"></div>
      </h3>
      {isLoading && <p>Loading data...</p>}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && (
        smartBoxData.length > 0 ? (
          <div className="data-cards-grid">
            {smartBoxData.map((log, index) => {
              const status = getLogStatus(log);
              const gmapsUrl = `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;

              return (
                <div 
                  key={log.id} 
                  className={`data-card ${isVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`status-indicator ${status.className}`}>
                    {status.text}
                  </div>
                  
                  <div className="data-item">
                    <Clock size={16} /> <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="data-item">
                    <Thermometer size={16} /> <span>{log.temperature?.toFixed(2)} °C</span>
                  </div>
                  <div className="data-item">
                    <Droplets size={16} /> <span>{log.humidity?.toFixed(2)} %</span>
                  </div>
                  
                  <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="data-item-link">
                    <div className="data-item">
                      <MapPin size={16} /> <span>{log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}</span>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Belum ada data yang diterima. Pastikan firmware berjalan dan mengirim data.</p>
        )
      )}
    </div>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    mealsProvided: 0,
    co2Saved: 0,
    peopleHelped: 0,
    volunteers: 0
  });

  const sectionsRef = useRef({});

  // Handle scroll effects with progress bar
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 100);
      
      // Calculate scroll progress
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced Intersection Observer with staggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
            
            if (entry.target.id === 'dashboard') {
              animateDashboard();
            }
          } else {
            // Remove the section from visible set when it leaves viewport
            setVisibleSections(prev => {
              const newSet = new Set(prev);
              newSet.delete(entry.target.id);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    Object.values(sectionsRef.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Animate dashboard counters
  const animateDashboard = () => {
    const targets = {
      mealsProvided: 12847,
      co2Saved: 892,
      peopleHelped: 5432,
      volunteers: 234
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
        setDashboardStats(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 16);
    });
  };

  const scrollToSection = (sectionId) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  const handleJoinProgram = () => {
    alert('Terima kasih atas minat Anda! Fitur pendaftaran akan segera tersedia.');
  };

  const handleDonate = () => {
    alert('Terima kasih atas niat baik Anda! Sistem donasi sedang dalam pengembangan.');
  };

  return (
    <div className="app-container">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Navigation */}
      <header className={`header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <nav className="nav">
          <div className="logo">
            <img src={SmartBoxLogo} alt="Smart Box IoT Logo" className="logo-icon" />
            <span>Smart Box IoT</span>
          </div>
          
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {[
              { id: 'home', label: 'What' },
              { id: 'program', label: 'Why' },
              { id: 'nutrition', label: 'How' },
              { id: 'dashboard', label: 'Dashboard' }
            ].map(item => (
              <li key={item.id}>
                <button onClick={() => scrollToSection(item.id)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <button className="mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" ref={el => sectionsRef.current.home = el} className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1 className="animate-slide-up">Smart Box IoT</h1>
          <div className="tagline animate-slide-up delay-200">
            Smart Monitoring for Nutritious Distribution
          </div>
          <p className="animate-slide-up delay-400">
            Smart Box IoT adalah sistem monitoring cerdas yang memantau dan menjaga suhu, kelembaban, dan lokasi bahan pangan.
            Dirancang untuk mendukung Program Makan Bergizi Gratis agar kualitas bahan pangan tetap terjaga sepanjang proses distribusi.
          </p>
        </div>
      </section>

      {/* Program Section */}
      <section 
        id="program" 
        ref={el => sectionsRef.current.program = el} 
        className={`section program ${visibleSections.has('program') ? 'section-visible' : ''}`}
      >
        <h2 className={`section-title ${visibleSections.has('program') ? 'title-visible' : ''}`}>
          Why Smart Box IoT?
          <div className="title-underline"></div>
        </h2>
        
        <div className="info-grid">
          {[
            {
              icon: <Heart />,
              title: "Monitoring System",
              content: "Smart Box IoT memanfaatkan sensor untuk memantau suhu dan kelembaban bahan pangan secara real-time guna menjaga kualitas selama distribusi dan penyimpanan."
            },
            {
              icon: <Users />,
              title: "Connected and Efficient",
              content: "Terintegrasi dengan GPS dan dashboard berbasis web yang hanya dapat diakses oleh admin terverifikasi, memastikan pengawasan distribusi berjalan efisien dan terkontrol."
            },
            {
              icon: <Leaf />,
              title: "Responsive and Secure",
              content: "Sistem mengirim notifikasi otomatis saat terjadi perubahan suhu atau kelembaban di luar batas normal, membantu petugas mengambil tindakan cepat agar pangan tetap layak konsumsi."
            }
          ].map((item, index) => (
            <div
              key={index}
              className={`info-card ${visibleSections.has('program') ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nutrition Section */}
      <section 
        id="nutrition" 
        ref={el => sectionsRef.current.nutrition = el} 
        className={`section nutrition ${visibleSections.has('nutrition') ? 'section-visible' : ''}`}
      >
        <h2 className={`section-title ${visibleSections.has('nutrition') ? 'title-visible' : ''}`}>
          How Smart Box IoT Improves Food Distribution and Storage
          <div className="title-underline"></div>
        </h2>
        
        <div className="features-grid">
          {[
            { emoji: "📦", title: "Maintains Food Quality", desc: "Sensor suhu dan kelembaban memastikan bahan makanan tetap dalam kondisi optimal selama penyimpanan dan perjalanan distribusi." },
            { emoji: "🛡️", title: "Reduces Risk of Damage", desc: "Sistem memberikan peringatan dini jika kondisi penyimpanan tidak sesuai, memungkinkan tindakan cepat untuk mencegah kerusakan atau pemborosan pangan." },
            { emoji: "🚚", title: "Enhances Delivery Efficiency", desc: "Pelacakan GPS membantu memantau posisi dan waktu pengiriman secara langsung, sehingga proses distribusi dapat dikelola dengan lebih tepat dan cepat." },
          ].map((item, index) => (
            <div
              key={index}
              className={`feature-card ${visibleSections.has('nutrition') ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="feature-emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Section */}
      <section 
        id="dashboard" 
        ref={el => sectionsRef.current.dashboard = el} 
        className={`section dashboard ${visibleSections.has('dashboard') ? 'section-visible' : ''}`}
      >
        <h2 className={`section-title ${visibleSections.has('dashboard') ? 'title-visible' : ''}`}>
          Dashboard Kontribusi
          <div className="title-underline"></div>
        </h2>
        
        <div className="stats-grid">
          {[
            { key: 'mealsProvided', label: 'Porsi Makanan Disalurkan', icon: <Heart /> },
            { key: 'co2Saved', label: 'Kg CO₂ Dikurangi', icon: <Leaf /> },
            { key: 'peopleHelped', label: 'Orang Terbantu', icon: <Users /> },
            { key: 'volunteers', label: 'Relawan Aktif', icon: <Award /> }
          ].map((stat, index) => (
            <div
              key={stat.key}
              className={`stat-card ${visibleSections.has('dashboard') ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">
                {dashboardStats[stat.key].toLocaleString('id-ID')}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <SmartBoxDataDisplay />
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          {[
            { id: 'home', label: 'Beranda' },
            { id: 'program', label: 'Program' },
            { id: 'nutrition', label: 'Nutrisi' },
            { id: 'dashboard', label: 'Dashboard' }
          ].map(item => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p>&copy; 2025 Makan Bergizi Gratis (MBG). Healthy Generation, Green Earth.</p>
      </footer>
    </div>
  );
}

export default App;