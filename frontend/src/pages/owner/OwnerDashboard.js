import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome,FaCalendarAlt,FaBell,FaStar,FaSignOutAlt,FaPlusCircle,FaDollarSign,FaChartBar,FaUsers,FaCut,FaBoxes,} from "react-icons/fa";
import "../../styles/owner/OwnerDashboard.css";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [dashboardCounts, setDashboardCounts] = useState({
    appointments: 0,
    reviews: 0,
    payments: 0,
  });

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
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/owner/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.counts) {
          setDashboardCounts({
            appointments: data.counts.appointments || 0,
            reviews: data.counts.reviews || 0,
            payments: data.counts.payments || 0,
          });
        }
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
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
        <h1>Welcome, Owner 👋</h1>
        <div className="dashboard-widgets">
          <div className="widget-card">
            <FaCalendarAlt className="widget-icon" />
            <h3>Appointments</h3>
            <p>{dashboardCounts.appointments} upcoming</p>
          </div>
          <div className="widget-card">
            <FaStar className="widget-icon" />
            <h3>Reviews</h3>
            <p>{dashboardCounts.reviews} new</p>
          </div>
          <div className="widget-card">
            <FaDollarSign className="widget-icon" />
            <h3>Payments</h3>
            <p>{dashboardCounts.payments} received</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OwnerDashboard;
