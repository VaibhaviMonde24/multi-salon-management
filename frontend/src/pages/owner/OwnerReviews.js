// File: src/pages/owner/OwnerReviews.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaBell, FaStar, FaSignOutAlt, FaDollarSign, FaCut, FaBoxes, FaChartBar, FaUsers } from "react-icons/fa";
import "../../styles/owner/OwnerReviews.css";

function OwnerReviews() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/owner/dashboard" },
    { name: "Salons", icon: <FaUsers />, path: "/owner/salons" },
    { name: "Services", icon: <FaCut />, path: "/owner/services" },
    { name: "Staff", icon: <FaUsers />, path: "/owner/staff" },
    { name: "Inventory", icon: <FaBoxes />, path: "/owner/inventory" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/owner/appointments" },
    { name: "Payments", icon: <FaDollarSign />, path: "/owner/payments" },
    { name: "Notifications", icon: <FaBell />, path: "/owner/notifications" },
    { name: "Reviews", icon: <FaStar />, path: "/owner/reviews" },
    { name: "Reports", icon: <FaChartBar />, path: "/owner/reports" },
  ];

  // Fetch all reviews for this owner's salons
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/owner/reviews", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReviews(data.reviews);
        else setError(data.message || "Failed to fetch reviews");
      })
      .catch((err) => {
        console.error("Fetch reviews error:", err);
        setError("Error fetching reviews");
      });
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="owner-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">SalonHub</div>
        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className={`sidebar-item ${item.path === "/owner/reviews" ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              <span className="item-name">{item.name}</span>
            </li>
          ))}
        </ul>
        <div className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="owner-reviews">
          <h1>Salon Reviews</h1>
          {error && <p className="error">{error}</p>}

          <div className="reviews-list">
            {reviews?.length === 0 && <p>No reviews yet.</p>}
            {reviews?.map((review) => (
              <div key={review.review_id} className="review-card">
                <div className="review-header">
                  <h3>
                    {review.customer_name} - {review.salon_name}
                  </h3>
                  <div className="rating">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <FaStar key={i} color="#FFD700" />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment || review.review_text}</p>
                <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OwnerReviews;