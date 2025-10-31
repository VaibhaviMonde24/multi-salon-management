// File: src/pages/owner/OwnerPayments.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaBell, FaStar, FaSignOutAlt, FaPlusCircle, FaDollarSign, FaChartBar, FaUsers, FaCut, FaBoxes } from "react-icons/fa";
import axios from "axios";
import "../../styles/owner/OwnerPayments.css";

function OwnerPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

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

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/owner/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPayments(res.data.data || []);
    } catch (err) {
      console.error("Payments fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchPayments();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Update payment status
  const updateStatus = async (payment_id, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/owner/payments/${payment_id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Payment status updated!");
        setPayments((prev) =>
          prev.map((p) =>
            p.payment_id === payment_id ? { ...p, payment_status: newStatus } : p
          )
        );
      } else {
        alert(res.data.message || "Failed to update payment status");
      }
    } catch (err) {
      console.error("Update status error:", err);
      alert("Error updating payment status");
    }
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
              className={`sidebar-item ${item.path === "/owner/payments" ? "active" : ""}`}
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
        <h1>
          <FaDollarSign /> Payments Received
        </h1>

        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No payments yet.</p>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Salon</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id}>
                  <td>{p.payment_id}</td>
                  <td>{p.customer_name || "-"}</td>
                  <td>{p.salon_name || "N/A"}</td>
                  <td>₹{Number(p.amount || 0).toFixed(2)}</td>
                  <td>{p.payment_method || "-"}</td>
                  <td>{p.payment_status || "Pending"}</td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                  <td>
                    {p.payment_status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(p.payment_id, "Completed")}
                        >
                          Complete
                        </button>{" "}
                        <button
                          onClick={() => updateStatus(p.payment_id, "Cancelled")}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {p.payment_status === "Completed" && <span>Completed</span>}
                    {p.payment_status === "Cancelled" && <span>Cancelled</span>}
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

export default OwnerPayments;
