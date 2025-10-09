import { useState, useEffect, useRef } from 'react';
import { Menu, X, Leaf, Heart, Users, Award, Thermometer, Droplets, MapPin, Clock } from 'lucide-react';
import './App.css';

const SmartBoxDataDisplay = () => {
  const [smartBoxData, setSmartBoxData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const boxIdToFetch = 'SMARTBOX-001'; // ID Box yang ingin ditampilkan datanya

  // Fungsi untuk menentukan status berdasarkan data log
  const getLogStatus = (log) => {
    if (!log || typeof log.temperature !== 'number' || typeof log.humidity !== 'number') {
      return { text: 'N/A', className: 'status-unknown' };
    }
    
    // Logika yang sama persis dengan firmware
    const isTempSafe = log.temperature >= 1.0 && log.temperature <= 4.0;
    const isHumidSafe = log.humidity >= 40.0 && log.humidity <= 60.0;

    if (isTempSafe && isHumidSafe) {
      return { text: 'Aman', className: 'status-safe' };
    } else {
      return { text: 'Bahaya', className: 'status-danger' };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // PERUBAHAN 1: Mengambil 6 data terbaru
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
    <div className="live-data-container">
      <h3 className="live-data-title">
        Live Data Feed (ID: {boxIdToFetch})
        <div className="live-indicator"></div>
      </h3>
      {isLoading && <p>Loading data...</p>}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && (
        smartBoxData.length > 0 ? (
          <div className="data-cards-grid">
            {smartBoxData.map((log) => {
              const status = getLogStatus(log);
              const gmapsUrl = `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;

              return (
                <div key={log.id} className="data-card">
                  {/* PERUBAHAN 2: Indikator status di pojok kanan atas */}
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
                  
                  {/* PERUBAHAN 3: Koordinat menjadi link ke Google Maps */}
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
  const [dashboardStats, setDashboardStats] = useState({
    mealsProvided: 0,
    co2Saved: 0,
    peopleHelped: 0,
    volunteers: 0
  });

  const sectionsRef = useRef({});

  // ... (sisa fungsi useEffect dan handler lainnya tetap sama)
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]))
            
            if (entry.target.id === 'dashboard') {
              animateDashboard()
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    Object.values(sectionsRef.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Animate dashboard counters
  const animateDashboard = () => {
    const targets = {
      mealsProvided: 12847,
      co2Saved: 892,
      peopleHelped: 5432,
      volunteers: 234
    }

    Object.entries(targets).forEach(([key, target]) => {
      const duration = 2000
      const increment = target / (duration / 16)
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setDashboardStats(prev => ({ ...prev, [key]: Math.floor(current) }))
      }, 16)
    })
  }

  const scrollToSection = (sectionId) => {
    const element = sectionsRef.current[sectionId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  const handleJoinProgram = () => {
    alert('Terima kasih atas minat Anda! Fitur pendaftaran akan segera tersedia.')
  }

  const handleDonate = () => {
    alert('Terima kasih atas niat baik Anda! Sistem donasi sedang dalam pengembangan.')
  }


  return (
    <div className="app-container">
      {/* ... (Header, Hero, Program, Nutrition, Impact sections tidak berubah) ... */}
      {/* Navigation */}
      <header className={`header ${isHeaderScrolled ? 'scrolled' : ''}`}>
        <nav className="nav">
          <div className="logo">
            <Leaf className="logo-icon" />
            <span>MBG</span>
          </div>
          
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {[
              { id: 'home', label: 'Beranda' },
              { id: 'program', label: 'Program' },
              { id: 'nutrition', label: 'Nutrisi' },
              { id: 'impact', label: 'Dampak Hijau' },
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
          <h1 className="animate-slide-up">Makan Bergizi Gratis</h1>
          <div className="tagline animate-slide-up delay-200">
            Healthy Generation, Green Earth
          </div>
          <p className="animate-slide-up delay-400">
            Bergabunglah dengan gerakan untuk menyediakan makanan bergizi gratis sambil menjaga 
            kelestarian lingkungan. Bersama kita ciptakan generasi sehat dan bumi yang hijau.
          </p>
          <div className="cta-buttons animate-slide-up delay-600">
            <button onClick={() => scrollToSection('program')} className="btn btn-primary">
              Pelajari Program
            </button>
            <button onClick={() => scrollToSection('dashboard')} className="btn btn-secondary">
              Mulai Berkontribusi
            </button>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" ref={el => sectionsRef.current.program = el} className="section program">
        <h2 className="section-title">
          Tentang Program MBG
          <div className="title-underline"></div>
        </h2>
        
        <div className="info-grid">
          {[
            {
              icon: <Heart />,
              title: "Apa itu MBG?",
              content: "Makan Bergizi Gratis (MBG) adalah program yang menyediakan makanan sehat dan bergizi secara gratis untuk masyarakat yang membutuhkan, sambil mempromosikan pola makan berkelanjutan yang ramah lingkungan."
            },
            {
              icon: <Users />,
              title: "Cara Berkontribusi",
              content: "Anda dapat berkontribusi melalui donasi, menjadi volunteer, atau menyebarkan kesadaran tentang pentingnya nutrisi dan keberlanjutan lingkungan. Setiap kontribusi sekecil apapun sangat berarti."
            },
            {
              icon: <Leaf />,
              title: "Dampak Sosial",
              content: "Program ini tidak hanya membantu mengatasi kelaparan, tetapi juga mendidik masyarakat tentang pilihan makanan yang sehat dan ramah lingkungan untuk masa depan yang berkelanjutan."
            }
          ].map((item, index) => (
            <div
              key={index}
              className={`info-card ${visibleSections.has('program') ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nutrition Section */}
      <section id="nutrition" ref={el => sectionsRef.current.nutrition = el} className="section nutrition">
        <h2 className="section-title">
          Nutrisi & Edukasi
          <div className="title-underline"></div>
        </h2>
        
        <div className="features-grid">
          {[
            { emoji: "🥬", title: "Sayuran Organik", desc: "Promosi konsumsi sayuran organik lokal yang kaya nutrisi dan ramah lingkungan" },
            { emoji: "🍎", title: "Buah-buahan Segar", desc: "Edukasi tentang manfaat buah-buahan segar untuk kesehatan dan kebugaran optimal" },
            { emoji: "🌾", title: "Biji-bijian Utuh", desc: "Pentingnya biji-bijian utuh sebagai sumber karbohidrat sehat dan berkelanjutan" },
            { emoji: "🥜", title: "Protein Nabati", desc: "Promosi protein nabati yang lebih ramah lingkungan dibanding protein hewani" }
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

      {/* Green Impact Section */}
      <section id="impact" ref={el => sectionsRef.current.impact = el} className="section impact">
        <h2 className="section-title">
          Dampak Hijau
          <div className="title-underline"></div>
        </h2>
        
        <div className="impact-content">
          <div className={`impact-text ${visibleSections.has('impact') ? 'visible' : ''}`}>
            <h3>Diet Sehat = Bumi Sehat</h3>
            <p>
              Pola makan bergizi yang berfokus pada makanan nabati tidak hanya baik untuk kesehatan tubuh, 
              tetapi juga mengurangi jejak karbon hingga 70%. Dengan memilih makanan lokal dan organik, 
              kita membantu mengurangi emisi gas rumah kaca dan mendukung pertanian berkelanjutan.
            </p>
            <ul>
              <li>Mengurangi jejak karbon hingga 70%</li>
              <li>Mendukung pertanian berkelanjutan</li>
              <li>Mengurangi penggunaan pestisida</li>
              <li>Menghemat sumber daya air</li>
            </ul>
          </div>
          <div className={`impact-visual ${visibleSections.has('impact') ? 'visible' : ''}`}>
            <div className="plant-icon">🌱</div>
            <p className="impact-label">Sustainable Future</p>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section id="dashboard" ref={el => sectionsRef.current.dashboard = el} className="section dashboard">
        <h2 className="section-title">
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

        {/* --- DI SINI KITA TAMBAHKAN KOMPONEN DATA LIVE --- */}
        <SmartBoxDataDisplay />
        
      </section>

      {/* ... (CTA Section dan Footer tidak berubah) ... */}
      {/* CTA Section */}
      <section className="cta-section">
        <h2>Mari Bergabung dengan Gerakan MBG!</h2>
        <p>Bersama kita wujudkan generasi sehat dan bumi hijau untuk masa depan yang lebih baik</p>
        <div className="cta-buttons">
          <button onClick={handleJoinProgram} className="btn btn-primary">
            Bergabung Sekarang
          </button>
          <button onClick={handleDonate} className="btn btn-secondary">
            Donasi
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          {[
            { id: 'home', label: 'Beranda' },
            { id: 'program', label: 'Program' },
            { id: 'nutrition', label: 'Nutrisi' },
            { id: 'impact', label: 'Dampak Hijau' },
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
  )
}

export default App;