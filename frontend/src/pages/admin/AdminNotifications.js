import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUsers,
  FaBuilding,
  FaEnvelope,
  FaBell,
  FaCalendarAlt,
  FaStar,
  FaDollarSign,} from "react-icons/fa";
import "../../styles/admin/AdminNotifications.css";

function AdminNotifications() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientRole, setRecipientRole] = useState("Customer");
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

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      return setStatus("Title and message are required.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, message, recipientRole }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus(` Notification sent to all ${recipientRole}s!`);
        setTitle("");
        setMessage("");
      } else {
        setStatus(data.message || " Failed to send notification");
      }
    } catch (err) {
      console.error("Send notification error:", err);
      setStatus(" Server error. Try again later.");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">SalonHub Admin</div>
        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className="sidebar-item"
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

      {/* Main content */}
      <main className="main-content">
        <h1>Send Notifications</h1>
        <div className="notification-form">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title..."
          />

          <label>Message:</label>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
          />

          <label>Recipient Role:</label>
          <select
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value)}
          >
            <option value="Customer">Customer</option>
            <option value="SalonOwner">SalonOwner</option>
          </select>

          <button onClick={handleSend}>Send Notification</button>
          {status && <p className="status">{status}</p>}
        </div>
      </main>
    </div>
  );
}

export default AdminNotifications;