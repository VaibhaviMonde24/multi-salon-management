// File: src/pages/owner/OwnerNotifications.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaCalendarAlt,
  FaBell,
  FaStar,
  FaSignOutAlt,
  FaPlusCircle,
  FaDollarSign,
  FaChartBar,
  FaUsers,
  FaCut,
  FaBoxes,
} from "react-icons/fa";
import "../../styles/owner/OwnerNotifications.css";

const OwnerNotifications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/owner/dashboard" },
    { name: "Salons", icon: <FaPlusCircle />, path: "/owner/salons" },
    { name: "Services", icon: <FaCut />, path: "/owner/services" },
    { name: "Staff", icon: <FaUsers />, path: "/owner/staff" },
    { name: "Inventory", icon: <FaBoxes />, path: "/owner/inventory" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/owner/appointments" },
    { name: "Payments", icon: <FaDollarSign />, path: "/owner/payments" },
    { name: "Notifications", icon: <FaBell />, path: "/owner/notifications" },
    { name: "Reviews", icon: <FaStar />, path: "/owner/reviews" },
    { name: "Reports", icon: <FaChartBar />, path: "/owner/reports" },
  ];

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/owner/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // Map backend fields to frontend-friendly ones
        const formatted = res.data.notifications.map((n) => ({
          notification_id: n.notification_id,
          message: n.message,
          is_read: n.notification_status === "Read",
          type: n.type,
          created_at: n.created_at,
        }));
        setNotifications(formatted);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setNotifications([]);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/owner/notifications/${id}/read`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/owner/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  // Logout
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
              className={`sidebar-item ${item.path === "/owner/notifications" ? "active" : ""}`}
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
        <h2>Notifications</h2>

        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul className="notifications-list">
            {notifications.map((n) => (
              <li key={n.notification_id} className={n.is_read ? "read" : "unread"}>
                <span>{n.message}</span>
                <div className="actions">
                  {!n.is_read && (
                    <button onClick={() => markRead(n.notification_id)}>Mark as Read</button>
                  )}
                  <button onClick={() => deleteNotification(n.notification_id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default OwnerNotifications;
