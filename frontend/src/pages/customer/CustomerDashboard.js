// src/pages/customer/CustomerDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
FaCalendarAlt,FaBell,FaStar,FaUser,FaSignOutAlt,FaPlusCircle,FaMoneyBillWave,} from "react-icons/fa";
import "../../styles/customer/CustomerDashboard.css";
function CustomerDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    appointments: 0,
    notifications: 0,
    messages: 0,
  });
  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/customer/dashboard" },
    { name: "Book Appointment", icon: <FaPlusCircle />, path: "/customer/book-appointment" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/customer/appointments" },
    { name: "Notifications", icon: <FaBell />, path: "/customer/notifications" },
    { name: "Reviews", icon: <FaStar />, path: "/customer/reviews" },
    { name: "Payments", icon: <FaMoneyBillWave />, path: "/customer/payments" },
    { name: "Profile", icon: <FaUser />, path: "/customer/profile" },
  ];
  // Fetch dashboard counts
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/customer/dashboard-counts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCounts({
            appointments: data.data.appointments || 0,
            notifications: data.data.notifications || 0,
            messages: data.data.messages || 0,
          });
        }
      })
      .catch((err) => console.error("Error fetching dashboard counts:", err));
  }, []);
  return (
    <div className="customer-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">SalonHub</div>
        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className="sidebar-item"
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
        <div
          className="sidebar-logout"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          <FaSignOutAlt /> Logout
        </div>
      </aside>
      {/* Main Content */}
      <main className="main-content">
        <h1>Welcome, Customer 👋</h1>

        <div className="dashboard-widgets">
          <div className="widget-card">
            <FaCalendarAlt className="widget-icon" />
            <h3>Upcoming Appointments</h3>
            <p>{counts.appointments} appointments this week</p>
          </div>
          <div className="widget-card">
            <FaBell className="widget-icon" />
            <h3>Notifications</h3>
            <p>{counts.notifications} new alerts</p>
          </div>
          <div className="widget-card">
            <FaStar className="widget-icon" />
            <h3>Reviews</h3>
            <p>Share your feedback</p>
          </div>
          <div className="widget-card">
            <FaMoneyBillWave className="widget-icon" />
            <h3>Payments</h3>
            <p>Pay for your upcoming appointments</p>
            {/* Make Payment button removed */}
          </div>
        </div>
      </main>
    </div>
  );
}
export default CustomerDashboard;