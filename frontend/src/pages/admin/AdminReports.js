import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaUsers, FaCalendarAlt, FaStar, FaDollarSign, FaBell, FaChartBar, FaCogs, FaSignOutAlt 
} from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "../../styles/admin/AdminReports.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [reportData, setReportData] = useState({});
  const [status, setStatus] = useState("");

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FaBuilding /> },
    { name: "Users", path: "/admin/users", icon: <FaUsers /> },
    { name: "Salons", path: "/admin/salons", icon: <FaBuilding /> },
    { name: "Appointments", path: "/admin/appointments", icon: <FaCalendarAlt /> },
    { name: "Reviews", path: "/admin/reviews", icon: <FaStar /> },
    { name: "Payments", path: "/admin/payments", icon: <FaDollarSign /> },
    { name: "Notifications", path: "/admin/notifications", icon: <FaBell /> },
    { name: "Reports", path: "/admin/reports", icon: <FaChartBar /> },
    { name: "Settings", path: "/admin/settings", icon: <FaCogs /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) return;

    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) setReportData(data.data);
        else setStatus(data.message || "Failed to load reports");
      } catch (err) {
        console.error("Fetch reports error:", err);
        setStatus("Server error. Please try again later.");
      }
    };

    fetchReports();
  }, [token]);

  // Charts data
  const appointmentsChartData = {
    labels: reportData.appointments?.map(d => d.month) || [],
    datasets: [
      {
        label: "Appointments per Month",
        data: reportData.appointments?.map(d => d.total_appointments) || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const revenueChartData = {
    labels: reportData.revenue?.map(d => d.month) || [],
    datasets: [
      {
        label: "Revenue per Month ($)",
        data: reportData.revenue?.map(d => d.total_revenue) || [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
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

      {/* Main content */}
      <main className="main-content">
        <h1>Reports Summary</h1>
        {status && <p className="status">{status}</p>}

        {/* Summary Widgets */}
        <div className="dashboard-widgets">
          <div className="widget-card">
            <h3>Total Customers</h3>
            <p>{reportData.total_customers || 0}</p>
          </div>
          <div className="widget-card">
            <h3>Total Owners</h3>
            <p>{reportData.total_owners || 0}</p>
          </div>
          <div className="widget-card">
            <h3>Total Salons</h3>
            <p>{reportData.total_salons || 0}</p>
          </div>
          <div className="widget-card">
            <h3>Completed Appointments</h3>
            <p>{reportData.completed_appointments || 0}</p>
          </div>
          <div className="widget-card">
            <h3>Pending Appointments</h3>
            <p>{reportData.pending_appointments || 0}</p>
          </div>
          <div className="widget-card">
            <h3>Total Revenue</h3>
            <p>${reportData.total_revenue || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          <div className="chart-card">
            <h2>Appointments per Month</h2>
            <Line data={appointmentsChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
          </div>

          <div className="chart-card">
            <h2>Revenue per Month</h2>
            <Bar data={revenueChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReports;
