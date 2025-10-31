import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDollarSign, FaSignOutAlt, FaUsers, FaBuilding, FaCalendarAlt, FaStar, FaEnvelope,FaBell, } from "react-icons/fa";
import "../../styles/admin/AdminPayments.css";

function AdminPayments() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [payments, setPayments] = useState([]);
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

  useEffect(() => {
    if (!token) return;

    const fetchPayments = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/payments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.payments) {
          setPayments(data.payments);
        } else {
          setStatus(data.message || "Failed to load payments");
        }
      } catch (err) {
        console.error("Fetch payments error:", err);
        setStatus("Server error. Please try again later.");
      }
    };

    fetchPayments();
  }, [token]);

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
        <h1>Payments & Revenue</h1>
        {status && <p className="status">{status}</p>}
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Salon</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((pay) => (
                  <tr key={pay.payment_id}>
                    <td>{pay.payment_id}</td>
                    <td>{pay.salon_name}</td>
                    <td>{pay.customer_name}</td>
                    <td>₹{pay.amount}</td>
                    <td>{pay.payment_method}</td>
                    <td>{pay.payment_status}</td>
                    <td>{new Date(pay.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No payments found
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

export default AdminPayments;