// src/pages/owner/OwnerBranches.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {FaHome,FaCalendarAlt,FaBell,FaStar,FaUser,FaSignOutAlt,FaPlusCircle,FaDollarSign,FaChartBar,FaUsers,FaBoxes,FaCodeBranch,} from "react-icons/fa";
import "../../styles/owner/OwnerBranches.css";

const OwnerBranches = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const token = localStorage.getItem("token");

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/owner/dashboard" },
    { name: "Salons", icon: <FaPlusCircle />, path: "/owner/salons" },
    { name: "Branches", icon: <FaCodeBranch />, path: "/owner/branches" },
    { name: "Staff", icon: <FaUsers />, path: "/owner/staff" },
    { name: "Inventory", icon: <FaBoxes />, path: "/owner/inventory" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/owner/appointments" },
    { name: "Payments", icon: <FaDollarSign />, path: "/owner/payments" },
    { name: "Notifications", icon: <FaBell />, path: "/owner/notifications" },
    { name: "Reviews", icon: <FaStar />, path: "/owner/reviews" },
    { name: "Reports", icon: <FaChartBar />, path: "/owner/reports" },
    { name: "Profile", icon: <FaUser />, path: "/owner/profile" },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/owner/branches", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBranches(res.data.data || []))
      .catch((err) => console.error("Error fetching branches:", err));
  }, [token]);

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
              className={`sidebar-item ${
                item.path === "/owner/branches" ? "active" : ""
              }`}
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
        <h2>Branches</h2>
        {branches.length === 0 ? (
          <p>No branches found.</p>
        ) : (
          <table className="branches-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Status</th>
                <th>Main</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.salon_id}>
                  <td>{b.salon_name}</td>
                  <td>{b.city}</td>
                  <td>{b.status}</td>
                  <td>{b.is_main ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default OwnerBranches;
