import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {FaUsers,FaUserShield,FaTrashAlt,FaSignOutAlt,FaBuilding,FaCalendarAlt,FaStar,FaDollarSign,FaEnvelope,FaBell,} from "react-icons/fa";
import "../../styles/admin/AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
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
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch users from API
  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.users) {
          setUsers(data.users);
        } else {
          setStatus(data.message || "Failed to load users");
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        setStatus("Server error. Please try again later.");
      }
    };

    fetchUsers();
  }, [token]);

  // Promote user to Salon Owner (only Customers allowed)
  const handlePromote = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/promote`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.user_id === id ? { ...u, role: "SalonOwner" } : u))
        );
        setStatus("User promoted successfully");
      } else {
        setStatus(data.message || "Failed to promote user");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error while promoting user");
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
        setStatus("User deleted successfully ");
      } else {
        setStatus(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      setStatus("Server error while deleting user");
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
        <div className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <h1>Users Management</h1>
        {status && <p className="status">{status}</p>}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td className="actions">
                      {/* Only allow Customers to be promoted */}
                      {user.role === "Customer" && (
                        <button onClick={() => handlePromote(user.user_id)}>
                          <FaUserShield /> Promote
                        </button>
                      )}
                      <button className="delete" onClick={() => handleDelete(user.user_id)}>
                        <FaTrashAlt /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No users available
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

export default AdminUsers;
