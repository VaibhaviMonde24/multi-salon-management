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
import "../../styles/admin/AdminContact.css"; // external css

function AdminContact() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Fetch all contact messages
  const fetchContacts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setContacts(data.contacts); // note: backend returns `contacts` array
      } else {
        setError(data.message || "Failed to fetch contact messages");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete contact message
  const deleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact message?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setContacts(contacts.filter((msg) => msg.id !== id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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
            <li
              key={idx}
              className={`sidebar-item ${window.location.pathname === item.path ? "active" : ""}`}
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
        <h1> Contact Us Messages</h1>

        {loading ? (
          <p>Loading contact messages...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : contacts.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <table className="contact-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Received At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((msg) => (
                <tr key={msg.id}>
                  <td>{msg.id}</td>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.message}</td>
                  <td>{new Date(msg.created_at).toLocaleString()}</td>
                  <td>
                    <button className="delete-btn" onClick={() => deleteContact(msg.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default AdminContact;
