import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaSearch,
  FaCut,
  FaSpa,
  FaHandSparkles,
  FaSmile,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import "../styles/Home.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Home() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [error, setError] = useState(null);

  const serviceIcons = {
    haircut: <FaCut />,
    "hair cut": <FaCut />,
    spa: <FaSpa />,
    manicure: <FaHandSparkles />,
    pedicure: <FaHandSparkles />,
    facial: <FaSmile />,
    "face treatment": <FaSmile />,
    massage: <FaSpa />,
    nails: <FaHandSparkles />,
  };

  const getServiceIcon = (serviceName) => {
    if (!serviceName) return <FaCut />;
    const key = serviceName.toLowerCase().trim();
    return serviceIcons[key] || <FaCut />;
  };

  useEffect(() => {
    // Fetch services
    fetch(`${API_URL}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setError("Failed to load services.");
      })
      .finally(() => setLoadingServices(false));

    // Fetch salons
    fetch(`${API_URL}/api/salons/all`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSalons(data.salons);
      })
      .catch((err) => {
        console.error("Error fetching salons:", err);
        setError("Failed to load salons.");
      })
      .finally(() => setLoadingSalons(false));
  }, []);

  // ✅ Service card click → नवीन page वर navigate
  const handleServiceClick = (serviceId, serviceName) => {
    setSelectedService(serviceId);
    navigate(`/salons/service/${serviceId}`, {
      state: { serviceName },
    });
  };

  const filteredSalons = salons.filter(
    (salon) =>
      salon.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.salon_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLoadingSalons(true);
    fetch(`${API_URL}/api/salons/search?query=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSalons(data.salons);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingSalons(false));
  };

  const handleBookNow = (salonId) => {
    localStorage.setItem("redirectSalonId", salonId);
    navigate("/login");
  };

  const renderStars = (rating = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} color={i < Math.round(rating) ? "#ff4081" : "#ccc"} />
    ));
  };

  return (
    <div className="home-container">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SalonHub</div>
        <div className="nav-links">
          <a href="#hero" className="nav-link">Home</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#salons" className="nav-link">Salons</a>
          <a href="#about" className="nav-link">About Us</a>
          <Link to="/contact" className="nav-link">Contact</Link>
          <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-btn signup" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-overlay">
          <h1>Find & Book the Best Salons Near You</h1>
          <p>Quickly browse salons, services, and staff to book your appointment.</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for salon, service, or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}><FaSearch /></button>
          </div>
        </div>
      </section>

      {error && (
        <div className="error-banner">⚠️ {error} Please refresh the page.</div>
      )}

      {/* Services Section */}
      <section className="services" id="services">
        <h2>Our Services</h2>
        <div className="services-list">
          {loadingServices ? (
            <p>Loading services...</p>
          ) : services.length > 0 ? (
            services.map((service) => (
              <div
                key={service.service_id}
                className={`service-card ${selectedService === service.service_id ? "selected" : ""}`}
                onClick={() => handleServiceClick(service.service_id, service.service_name)}
                style={{ cursor: "pointer" }}
              >
                <div className="service-icon">{getServiceIcon(service.service_name)}</div>
                <span>{service.service_name}</span>
              </div>
            ))
          ) : (
            <p>No services available.</p>
          )}
        </div>
      </section>

      {/* Salons Section */}
      <section className="salon-section" id="salons">
        <h2>Salons</h2>
        <div className="salon-list">
          {loadingSalons ? (
            <p>Loading salons...</p>
          ) : filteredSalons.length > 0 ? (
            filteredSalons.map((salon) => (
              <div key={salon.salon_id} className="salon-card">
                <div className="salon-image-container">
                  <img
                    src={salon.salon_logo || "/images/default-salon.jpg"}
                    alt={salon.salon_name}
                    onError={(e) => { e.target.src = "/images/default-salon.jpg"; }}
                  />
                </div>
                <div className="salon-info">
                  <h3>{salon.salon_name}</h3>
                  <p><FaMapMarkerAlt /> {salon.salon_address}</p>
                  <p><FaPhoneAlt /> {salon.salon_phone_number}</p>
                  <p className="rating">
                    {renderStars(salon.rating)}
                    <span style={{ marginLeft: "6px", fontSize: "13px", color: "#666" }}>
                      {salon.rating ? `(${salon.rating})` : "No ratings yet"}
                    </span>
                  </p>
                  <button className="book-btn" onClick={() => handleBookNow(salon.salon_id)}>
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No salons found. Try a different search.</p>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <h2>About SalonHub</h2>
        <p>
          SalonHub is your ultimate platform to discover, book, and manage salon appointments easily.
          From haircuts to spa treatments, we connect customers with top-rated salons and services nearby.
          Our goal is to make beauty and wellness services accessible, fast, and convenient for everyone.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebook /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FaTwitter /></a>
        </div>
        <p>© 2026 SalonHub. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default Home;