// src/pages/customer/Notifications.jsx
import React, { useEffect, useState } from "react";
import "../../styles/customer/Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) setNotifications(data.data || []);
      } catch (err) {
        console.error("Fetch notifications error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === id ? { ...n, notification_status: "Read" } : n
          )
        );
      }
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div
      className="notifications-page"
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        background: `linear-gradient(to bottom right, rgba(252,228,236,0.6), rgba(243,229,245,0.6)), url('/images/salonback.jpg') no-repeat center center/cover`,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div className="notifications-container">
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          <ul className="notifications-list">
            {notifications.map((n) => (
              <li
                key={n.notification_id}
                className={n.notification_status === "Unread" ? "unread" : "read"}
              >
                <strong>{n.title || "Notification"}</strong>
                <p>{n.message}</p>
                <small>{new Date(n.created_at).toLocaleString()}</small>
                {n.notification_status === "Unread" && (
                  <button onClick={() => markAsRead(n.notification_id)}>Mark as read</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Notifications;
