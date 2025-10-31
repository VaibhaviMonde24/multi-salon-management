import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCheck, FaTimes, FaSignOutAlt, FaUsers, FaBuilding, 
  FaCalendarAlt, FaStar, FaDollarSign, FaBell, FaTrash ,FaEnvelope
} from "react-icons/fa";
import "../../styles/admin/AdminSalons.css";

function AdminSalons() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [pendingSalons, setPendingSalons] = useState([]);
  const [allSalons, setAllSalons] = useState([]);
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

  // Fetch pending and all salons
  useEffect(() => {
    if (!token) return;

    const fetchSalons = async () => {
      try {
        const [pendingRes, allRes] = await Promise.all([
          fetch("http://localhost:5000/api/admin/pending-salons", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/admin/salons", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const pendingData = await pendingRes.json();
        const allData = await allRes.json();

        if (pendingData.success) setPendingSalons(pendingData.salons || []);
        if (allData.success) setAllSalons(allData.salons || []);

        if ((!pendingData.success && pendingData.message) || (!allData.success && allData.message)) {
          setStatus(pendingData.message || allData.message);
        }
      } catch (err) {
        console.error(err);
        setStatus("Server error. Please try again later.");
      }
    };

    fetchSalons();
  }, [token]);

  // Approve or reject pending salon
  const handleUpdateStatus = async (id, statusValue) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/salons/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusValue })
      });
      const data = await res.json();
      if (data.success) setPendingSalons(prev => prev.filter(s => s.salon_id !== id));
      else setStatus(data.message);
    } catch (err) {
      console.error(err);
      setStatus(`Server error while ${statusValue}`);
    }
  };

  // Delete any salon (all salons view)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salon?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/salons/${id}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.success) setAllSalons(prev => prev.filter(s => s.salon_id !== id));
      else setStatus(data.message);
    } catch (err) {
      console.error(err);
      setStatus("Server error while deleting");
    }
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
        <div className="sidebar-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <h1>Pending Salons Approval</h1>
        {status && <p className="status">{status}</p>}

        <div className="salons-table-container">
          <table className="salons-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Owner</th><th>City</th><th>Category</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingSalons.length > 0 ? pendingSalons.map((salon) => (
                <tr key={salon.salon_id}>
                  <td>{salon.salon_id}</td>
                  <td>{salon.salon_name}</td>
                  <td>{salon.owner_name}</td>
                  <td>{salon.city}</td>
                  <td>{salon.category}</td>
                  <td>{salon.status}</td>
                  <td className="actions">
                    <button onClick={() => handleUpdateStatus(salon.salon_id, "approved")}><FaCheck /> Approve</button>
                    <button className="reject" onClick={() => handleUpdateStatus(salon.salon_id, "rejected")}><FaTimes /> Reject</button>
                  </td>
                </tr>
              )) : <tr><td colSpan="7" style={{ textAlign: "center" }}>No pending salons</td></tr>}
            </tbody>
          </table>
        </div>

        <h1>All Salons in System</h1>
        <div className="salons-table-container">
          <table className="salons-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Owner</th><th>Email</th><th>City</th><th>Category</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSalons.length > 0 ? allSalons.map((salon) => (
                <tr key={salon.salon_id}>
                  <td>{salon.salon_id}</td>
                  <td>{salon.salon_name}</td>
                  <td>{salon.owner_name}</td>
                  <td>{salon.owner_email || "-"}</td>
                  <td>{salon.city}</td>
                  <td>{salon.category}</td>
                  <td>{salon.status}</td>
                  <td>
                    <button className="delete" onClick={() => handleDelete(salon.salon_id)}><FaTrash /> Delete</button>
                  </td>
                </tr>
              )) : <tr><td colSpan="8" style={{ textAlign: "center" }}>No salons found</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminSalons;
