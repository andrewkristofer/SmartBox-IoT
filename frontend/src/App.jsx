import { useState, useEffect, useRef } from "react";
import SmartBoxLogo from "./assets/smartboxiotlogo.png";
import {
  Menu,
  X,
  Leaf,
  Heart,
  Users,
  Award,
  Thermometer,
  Droplets,
  MapPin,
  Clock,
} from "lucide-react";
import { useSettings } from "./contexts/SettingsContext";
import SettingsPanel from "./components/SettingPanel";
import { useTranslation } from "react-i18next";
import "./App.css";

const SmartBoxDataDisplay = () => {
  const { t } = useTranslation();
  const [smartBoxData, setSmartBoxData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const { refreshInterval, temperatureUnit } = useSettings();

  const boxIdToFetch = "SMARTBOX-001";

  const convertTemperature = (celsius) => {
    if (temperatureUnit === "fahrenheit") {
      return (celsius * 9) / 5 + 32;
    }
    return celsius;
  };

  const getTemperatureUnit = () => {
    return temperatureUnit === "fahrenheit" ? "°F" : "°C";
  };

  const getLogStatus = (log) => {
    if (
      !log ||
      typeof log.temperature !== "number" ||
      typeof log.humidity !== "number"
    ) {
      return { text: "N/A", className: "status-unknown" };
    }

    const isTempSafe = log.temperature >= 1.0 && log.temperature <= 4.0;
    const isHumidSafe = log.humidity >= 40.0 && log.humidity <= 60.0;

    if (isTempSafe && isHumidSafe) {
      return { text: "Aman", className: "status-safe" };
    } else {
      return { text: "Bahaya", className: "status-danger" };
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
        const response = await fetch(
          `http://localhost:5000/api/data/${boxIdToFetch}?limit=6`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSmartBoxData(data);
      } catch (e) {
        console.error("Fetch error:", e);
        const message = e.message.includes("Failed to fetch")
          ? t("errors.connectionRefused")
          : t("errors.backendFetch");
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [boxIdToFetch, refreshInterval]);

  return (
    <div
      ref={containerRef}
      className={`live-data-container ${isVisible ? "visible" : ""}`}
    >
      <h3 className="live-data-title">
        Live Data Feed (ID: {boxIdToFetch})
        <div className="live-indicator"></div>
      </h3>
      {isLoading && <p>Loading data...</p>}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}
      {!isLoading &&
        !error &&
        (smartBoxData.length > 0 ? (
          <div className="data-cards-grid">
            {smartBoxData.map((log, index) => {
              const status = getLogStatus(log);
              const gmapsUrl = `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;

              return (
                <div
                  key={log.id}
                  className={`data-card ${isVisible ? "visible" : ""}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`status-indicator ${status.className}`}>
                    {status.text}
                  </div>

                  <div className="data-item">
                    <Clock size={16} />{" "}
                    <span>
                      {new Date(log.timestamp).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="data-item">
                    <Thermometer size={16} />{" "}
                    <span>
                      {convertTemperature(log.temperature).toFixed(2)}{" "}
                      {getTemperatureUnit()}
                    </span>
                  </div>
                  <div className="data-item">
                    <Droplets size={16} />{" "}
                    <span>{log.humidity?.toFixed(2)} %</span>
                  </div>

                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="data-item-link"
                  >
                    <div className="data-item">
                      <MapPin size={16} />{" "}
                      <span>
                        {log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}
                      </span>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <p>{t("errors.noData")}</p>
        ))}
    </div>
  );
};

function App() {
  const { t } = useTranslation(); // 🟢 Hook penerjemah
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    mealsProvided: 0,
    co2Saved: 0,
    peopleHelped: 0,
    volunteers: 0,
  });

  const sectionsRef = useRef({});

  // Handle scroll effects with progress bar
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 100);

      // Calculate scroll progress
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced Intersection Observer with staggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));

            if (entry.target.id === "dashboard") {
              animateDashboard();
            }
          } else {
            // Remove the section from visible set when it leaves viewport
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

    Object.values(sectionsRef.current).forEach((ref) => {
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
      volunteers: 234,
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
        setDashboardStats((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, 16);
    });
  };

  const scrollToSection = (sectionId) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMenuOpen(false);
    }
  };

  const handleJoinProgram = () => {
    alert(
      "Terima kasih atas minat Anda! Fitur pendaftaran akan segera tersedia."
    );
  };

  const handleDonate = () => {
    alert(
      "Terima kasih atas niat baik Anda! Sistem donasi sedang dalam pengembangan."
    );
  };

  return (
    <div className="app-container">
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Settings Panel */}
      <SettingsPanel />

      {/* Settings Panel */}
      <SettingsPanel />

      {/* Navigation */}
      <header className={`header ${isHeaderScrolled ? "scrolled" : ""}`}>
        <nav className="nav">
          <div className="logo">
            <img
              src={SmartBoxLogo}
              alt="Smart Box IoT Logo"
              className="logo-icon"
            />
            <span>Smart Box IoT</span>
          </div>

          <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            {[
              { id: "home", label: "What" },
              { id: "program", label: "Why" },
              { id: "nutrition", label: "How" },
              { id: "dashboard", label: "Dashboard" },
            ].map((item) => (
              <li key={item.id}>
                <button onClick={() => scrollToSection(item.id)}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            className="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
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

      {/* Program Section */}
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
              icon: <Leaf />,
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

      {/* Nutrition Section */}
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

      {/* Dashboard Section */}
      <section
        id="dashboard"
        ref={(el) => (sectionsRef.current.dashboard = el)}
        className={`section dashboard ${
          visibleSections.has("dashboard") ? "section-visible" : ""
        }`}
      >
        <h2
          className={`section-title ${
            visibleSections.has("dashboard") ? "title-visible" : ""
          }`}
        >
          {t("dashboard.title")}
          <div className="title-underline"></div>
        </h2>

        <div className="stats-grid">
          {[
            {
              key: "mealsProvided",
              label: t("dashboard.stats.meals"),
              icon: <Heart />,
            },
            {
              key: "co2Saved",
              label: t("dashboard.stats.co2"),
              icon: <Leaf />,
            },
            {
              key: "peopleHelped",
              label: t("dashboard.stats.people"),
              icon: <Users />,
            },
            {
              key: "volunteers",
              label: t("dashboard.stats.volunteers"),
              icon: <Award />,
            },
          ].map((stat, index) => (
            <div
              key={stat.key}
              className="stat-card visible"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">
                {dashboardStats[stat.key].toLocaleString("id-ID")}
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
            { id: "home", label: t("footer.home") },
            { id: "program", label: t("footer.program") },
            { id: "nutrition", label: t("footer.nutrition") },
            { id: "dashboard", label: t("footer.dashboard") },
          ].map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p>{t("footer.copyright")}</p>
      </footer>
    </div>
  );
}

export default App;
