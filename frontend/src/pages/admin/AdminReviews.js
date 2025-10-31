import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaSignOutAlt, FaUsers, FaBuilding, FaCalendarAlt, FaEnvelope,FaDollarSign, FaBell,  FaTrash } from "react-icons/fa";
import "../../styles/admin/AdminReviews.css";

function AdminReviews() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("");

  const menuItems = [
      { name: "Dashboard", path: "/admin/dashboard", icon: <FaBuilding /> },
      { name: "Users", path: "/admin/users", icon: <FaUsers /> },
      { name: "Salons", path: "/admin/salons", icon: <FaBuilding /> },
      { name: "Appointments", path: "/admin/appointments", icon: <FaCalendarAlt /> },
      { name: "Reviews", path: "/admin/reviews", icon: <FaStar /> },
      { name: "Payments", path: "/admin/payments", icon: <FaDollarSign /> },
      { name: "Notifications", path: "/admin/notifications", icon: <FaBell /> },
      { name: "Contact Messages", path: "/admin/contacts", icon: <FaEnvelope /> },
        ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch reviews from backend
  useEffect(() => {
    if (!token) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/reviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        } else {
          setStatus(data.message || "Failed to load reviews");
        }
      } catch (err) {
        console.error("Fetch reviews error:", err);
        setStatus("Server error. Please try again later.");
      }
    };

    fetchReviews();
  }, [token]);

  // Delete a review
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/review/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r.review_id !== id));
      } else {
        setStatus(data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error while deleting review");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">SalonHub Admin</div>
        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li key={idx} className="sidebar-item" onClick={() => navigate(item.path)}>
              <span className="icon">{item.icon}</span>
              <span className="item-name">{item.name}</span>
            </li>
          ))}
        </ul>
        <div className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <h1>All Reviews</h1>
        {status && <p className="status">{status}</p>}
        <div className="reviews-table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Salon</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <tr key={rev.review_id}>
                    <td>{rev.review_id}</td>
                    <td>{rev.customer_name}</td>
                    <td>{rev.salon_name}</td>
                    <td>{rev.rating}</td>
                    <td>{rev.comment || "-"}</td>
                    <td>{new Date(rev.created_at).toLocaleString()}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(rev.review_id)}>
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
export default AdminReviews;
