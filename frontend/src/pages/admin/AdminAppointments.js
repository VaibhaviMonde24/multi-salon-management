import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaSignOutAlt, FaUsers, FaBuilding, FaStar, FaEnvelope,FaDollarSign, FaBell } from "react-icons/fa";
import "../../styles/admin/AdminAppointments.css";

function AdminAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaBuilding /> },
    { name: "Users", path: "/admin/users", icon: <FaUsers /> },
    { name: "Salons", path: "/admin/salons", icon: <FaBuilding /> },
    { name: "Appointments", path: "/admin/appointments", icon: <FaCalendarAlt /> },
    { name: "Reviews", path: "/admin/reviews", icon: <FaStar /> },
    { name: "Payments", path: "/admin/payments", icon: <FaDollarSign /> },
    { name: "Notifications", path: "/admin/notifications", icon: <FaBell /> },
    { name: "Messages", path: "/admin/messages", icon: <FaEnvelope /> },
  ];

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch appointments");
        }

        setAppointments(data.appointments);
      } catch (err) {
        console.error("Fetch appointments error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, navigate]);

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
        <h1>All Appointments</h1>
        <div className="appointments-table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Salon</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "red" }}>{error}</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No appointments found</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.appointment_id}>
                    <td>{appt.appointment_id}</td>
                    <td>{appt.customer_name ?? "-"}</td>
                    <td>{appt.salon_name ?? "-"}</td>
                    <td>{appt.service_name ?? "-"}</td>
                    <td>{new Date(appt.appointment_datetime).toLocaleString()}</td>
                    <td>{appt.status}</td>
                    <td>{appt.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminAppointments;
