// File: src/pages/owner/OwnerReports.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {FaHome,FaCalendarAlt,FaBell,FaStar,FaPlusCircle,FaDollarSign,FaChartBar,FaUsers,FaCut,FaBoxes,FaSignOutAlt} from "react-icons/fa";
import "../../styles/owner/OwnerReports.css";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OwnerReports = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ revenue: [], appointments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/owner/reports", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setData({
          appointments: res.data.data.appointments || [],
          revenue: res.data.data.revenue || [],
        });
      } else {
        setError("Failed to fetch reports.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="owner-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">SalonHub</div>
        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className={`sidebar-item ${item.path === "/owner/reports" ? "active" : ""}`}
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
        <div className="owner-reports">
          <h2>Reports & Analytics</h2>

          {/* Revenue Chart */}
          <div className="chart-container">
            <h3>Revenue per Month</h3>
            {data.revenue.length ? (
              <Bar
                data={{
                  labels: data.revenue.map(d => d.month),
                  datasets: [
                    {
                      label: "Revenue ($)",
                      data: data.revenue.map(d => d.total_revenue),
                      backgroundColor: "rgba(75,192,192,0.6)",
                    },
                  ],
                }}
              />
            ) : (
              <p>No revenue data available</p>
            )}
          </div>

          {/* Appointments Chart */}
          <div className="chart-container">
            <h3>Appointments per Month</h3>
            {data.appointments.length ? (
              <Bar
                data={{
                  labels: data.appointments.map(d => d.month),
                  datasets: [
                    {
                      label: "Appointments",
                      data: data.appointments.map(d => d.total_appointments),
                      backgroundColor: "rgba(153,102,255,0.6)",
                    },
                  ],
                }}
              />
            ) : (
              <p>No appointments data available</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerReports;
