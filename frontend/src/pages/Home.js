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

function Home() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const serviceIcons = {
    haircut: <FaCut />,
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
    const key = serviceName.toLowerCase().replace(/\s+/g, "");
    return serviceIcons[key] || <FaCut />;
  };

  // Fetch services
  useEffect(() => {
    fetch("http://localhost:5000/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  // Fetch salons
  useEffect(() => {
    fetch("http://localhost:5000/api/salons/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSalons(data.salons);
      })
      .catch((err) => console.error("Error fetching salons:", err));
  }, []);

  const handleServiceClick = (serviceId) => {
    setSelectedService(serviceId);
    fetch(`http://localhost:5000/api/salons/by-service/${serviceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSalons(data.salons);
      })
      .catch((err) => console.error(err));
  };

  const filteredSalons = salons.filter(
    (salon) =>
      salon.salon_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.salon_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => {
    fetch(`http://localhost:5000/api/salons/search?query=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSalons(data.salons);
      })
      .catch((err) => console.error(err));
  };

  const handleBookNow = (salonId) => {
    navigate("/login");
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

      {/* Services Section */}
      <section className="services" id="services">
        <h2>Our Services</h2>
        <div className="services-list">
          {services.length > 0 ? services.map((service) => (
            <div
              key={service.service_id}
              className={`service-card ${selectedService === service.service_id ? "selected" : ""}`}
              onClick={() => handleServiceClick(service.service_id)}
            >
              <div className="service-icon">{getServiceIcon(service.service_name)}</div>
              <span>{service.service_name}</span>
            </div>
          )) : <p>Loading services...</p>}
        </div>
      </section>

      {/* Featured Salons */}
      <section className="salon-section" id="salons">
        <h2>Salons</h2>
        <div className="salon-list">
          {filteredSalons.length > 0 ? filteredSalons.map((salon) => (
            <div key={salon.salon_id} className="salon-card">
              <div className="salon-image-container">
                <img
                  src={salon.salon_logo || "https://source.unsplash.com/300x200/?salon,beauty"}
                  alt={salon.salon_name}
                />
              </div>
              <div className="salon-info">
                <h3>{salon.salon_name}</h3>
                <p><FaMapMarkerAlt /> {salon.salon_address}</p>
                <p><FaPhoneAlt /> {salon.salon_phone_number}</p>
                <p className="rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} color={i < 4 ? "#ff4081" : "#ccc"} />
                  ))}
                </p>
                <button className="book-btn" onClick={() => handleBookNow(salon.salon_id)}>Book Now</button>
              </div>
            </div>
          )) : <p>No salons found.</p>}
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
          <FaFacebook />
          <FaInstagram />
          <FaTwitter />
        </div>
        <p>© 2025 SalonHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
