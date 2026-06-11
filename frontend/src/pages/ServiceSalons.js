import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaArrowLeft,
} from "react-icons/fa";
import "../styles/Home.css"; // same styles वापरतो

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ServiceSalons() {
  const { serviceId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const serviceName = state?.serviceName || "Service";

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/salons/by-service/${serviceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSalons(data.salons);
        } else {
          setError("Could not load salons.");
        }
      })
      .catch((err) => {
        console.error("Error fetching salons by service:", err);
        setError("Something went wrong. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

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
          <a href="/" className="nav-link">Home</a>
          <a href="/#services" className="nav-link">Services</a>
          <a href="/#salons" className="nav-link">Salons</a>
          <a href="/#about" className="nav-link">About Us</a>
          <a href="/contact" className="nav-link">Contact</a>
          <button className="nav-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-btn signup" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* Header */}
      <div style={{ padding: "30px 40px 10px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            color: "#ff4081",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "16px",
            fontWeight: "600",
          }}
        >
          <FaArrowLeft /> Back to Home
        </button>

        <h2 style={{ fontSize: "26px", color: "#333", margin: "0 0 6px" }}>
          Salons offering{" "}
          <span style={{ color: "#ff4081" }}>{serviceName}</span>
        </h2>
        <p style={{ color: "#888", fontSize: "14px" }}>
          {loading ? "Loading..." : `${salons.length} salon(s) found`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner" style={{ margin: "0 40px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Salons List */}
      <div className="salon-list" style={{ padding: "10px 40px 60px" }}>
        {loading ? (
          <p>Loading salons...</p>
        ) : salons.length > 0 ? (
          salons.map((salon) => (
            <div key={salon.salon_id} className="salon-card">
              <div className="salon-image-container">
                <img
                  src={salon.salon_logo || "/images/default-salon.jpg"}
                  alt={salon.salon_name}
                  onError={(e) => {
                    e.target.src = "/images/default-salon.jpg";
                  }}
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
                <button
                  className="book-btn"
                  onClick={() => handleBookNow(salon.salon_id)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
            <p style={{ fontSize: "18px" }}>
              😕 No salons found for <strong>{serviceName}</strong>
            </p>
            <p>Try browsing all salons instead.</p>
            <button
              className="book-btn"
              style={{ marginTop: "16px" }}
              onClick={() => navigate("/")}
            >
              Browse All Salons
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 SalonHub. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default ServiceSalons;