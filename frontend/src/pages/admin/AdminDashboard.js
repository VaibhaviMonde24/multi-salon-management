import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaBuilding, 
  FaCalendarAlt, 
  FaStar, 
  FaEnvelope,
  FaSignOutAlt, 
  FaDollarSign, 
  FaBell, 
} from "react-icons/fa";
import "../../styles/admin/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    total_users: 0,
    total_salons: 0,
    total_appointments: 0,
    total_reviews: 0,
    total_revenue: 0
  });

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");
        return res.json();
      })
      .then(data => {
        if (data.success && data.data) {
          setSummary({
            total_users: data.data.total_users,  // All users including Admin, Owner, Customer
            total_salons: data.data.total_salons,
            total_appointments: (data.data.completed_appointments || 0) + (data.data.pending_appointments || 0),
            total_reviews: data.data.total_reviews || 0,
            total_revenue: data.data.total_revenue || 0
          });
        } else {
          console.error("Dashboard summary error:", data.message);
        }
      })
      .catch(err => console.error("Admin dashboard fetch error:", err));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

      {/* Main Content */}
      <main className="main-content">
        <h1>Welcome, Admin 👋</h1>
        <div className="dashboard-widgets">
          <div className="widget-card">
            <FaUsers className="widget-icon" />
            <h3>Total Users</h3>
            <p>{summary.total_users}</p>
          </div>
          <div className="widget-card">
            <FaBuilding className="widget-icon" />
            <h3>Total Salons</h3>
            <p>{summary.total_salons}</p>
          </div>
          <div className="widget-card">
            <FaCalendarAlt className="widget-icon" />
            <h3>Total Appointments</h3>
            <p>{summary.total_appointments}</p>
          </div>
          <div className="widget-card">
            <FaStar className="widget-icon" />
            <h3>Total Reviews</h3>
            <p>{summary.total_reviews}</p>
          </div>
          <div className="widget-card">
            <FaDollarSign className="widget-icon" />
            <h3>Total Revenue</h3>
            <p>₹ {summary.total_revenue}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
