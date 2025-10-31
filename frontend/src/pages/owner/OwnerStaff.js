import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {FaHome, FaCalendarAlt, FaBell, FaSignOutAlt,FaPlusCircle, FaDollarSign, FaChartBar, FaUsers, FaCut,FaBoxes,} from "react-icons/fa";
import axios from "axios";
import "../../styles/owner/OwnerStaff.css";

function OwnerStaff() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const axiosConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [branches, setBranches] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    salon_id: "",
    branch_id: "",
    staff_role: "",
    staff_status: "Active",
  });

  // Fetch Staff
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/staff", axiosConfig);
      setStaff(res.data.staff || []);
      setError(null);
    } catch (err) {
      console.error("Fetch staff error:", err);
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }, [axiosConfig]);

  // Fetch Salons and Branches
  const fetchSalons = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/owner/salons", axiosConfig);
      const salonsData = res.data.data || [];
      setSalons(salonsData);

      const branchesData = {};
      for (let salon of salonsData) {
        const branchRes = await axios.get(`http://localhost:5000/api/salons/${salon.salon_id}/branches`, axiosConfig);
        branchesData[salon.salon_id] = branchRes.data.data || [];
      }
      setBranches(branchesData);

    } catch (err) {
      console.error("Fetch salons error:", err);
      setError(err.response?.data?.message || "Server error");
    }
  }, [axiosConfig]);

  useEffect(() => {
    fetchSalons();
    fetchStaff();
  }, [fetchSalons, fetchStaff]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  // Handle form submit with fix for branch_id
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.salon_id) return alert("Please select a salon.");

    const payload = {
      ...form,
      salon_id: Number(form.salon_id),
      // Fix: send undefined if branch_id is empty string (not selected)
      branch_id: form.branch_id ? Number(form.branch_id) : undefined,
    };

    try {
      if (editingStaffId) {
        await axios.put(`http://localhost:5000/api/staff/${editingStaffId}`, payload, axiosConfig);
        setEditingStaffId(null);
      } else {
        await axios.post("http://localhost:5000/api/staff", payload, axiosConfig);
      }

      setForm({
        name: "",
        email: "",
        phone_number: "",
        salon_id: "",
        branch_id: "",
        staff_role: "",
        staff_status: "Active",
      });

      fetchStaff();
    } catch (err) {
      console.error("Staff submit error:", err);
      setError(err.response?.data?.message || "Server error");
    }
  }, [editingStaffId, form, axiosConfig, fetchStaff]);

  // Edit staff
  const handleEdit = useCallback((s) => {
    setEditingStaffId(s.staff_id);
    setForm({
      name: s.name,
      email: s.email,
      phone_number: s.phone_number,
      salon_id: s.salon_id,
      branch_id: s.branch_id || "",
      staff_role: s.staff_role,
      staff_status: s.staff_status,
    });
  }, []);

  // Delete staff
  const handleDelete = useCallback(async (staff_id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/staff/${staff_id}`, axiosConfig);
      fetchStaff();
    } catch (err) {
      console.error("Delete staff error:", err);
      setError(err.response?.data?.message || "Server error");
    }
  }, [axiosConfig, fetchStaff]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/owner/dashboard" },
    { name: "Salons", icon: <FaPlusCircle />, path: "/owner/salons" },
    { name: "Services", icon: <FaCut />, path: "/owner/services" },
    { name: "Staff", icon: <FaUsers />, path: "/owner/staff" },
    { name: "Inventory", icon: <FaBoxes />, path: "/owner/inventory" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/owner/appointments" },
    { name: "Payments", icon: <FaDollarSign />, path: "/owner/payments" },
    { name: "Notifications", icon: <FaBell />, path: "/owner/notifications" },
    { name: "Reports", icon: <FaChartBar />, path: "/owner/reports" },
  ];

  return (
    <div className="owner-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">SalonHub</div>
        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              className={`sidebar-item ${item.path === "/owner/staff" ? "active" : ""}`}
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
        <h2>Staff Management</h2>
        {error && <p className="error-text">{error}</p>}
        {loading ? <p>Loading staff...</p> : (
          <>
            <table className="staff-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Salon</th>
                  <th>Branch</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.staff_id}>
                    <td>{s.staff_id}</td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone_number}</td>
                    <td>{salons.find(salon => salon.salon_id === s.salon_id)?.salon_name || "N/A"}</td>
                    <td>{
                      branches[s.salon_id]?.find(b => b.branch_id === s.branch_id)?.branch_name || "Main Salon"
                    }</td>
                    <td>{s.staff_role}</td>
                    <td>{s.staff_status}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(s)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(s.staff_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add/Edit Form */}
            <div className="form-container">
              <h3>{editingStaffId ? "Edit Staff" : "Add Staff"}</h3>
              <form className="staff-form" onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input type="text" name="phone_number" placeholder="Phone Number" value={form.phone_number} onChange={handleChange} required />

                {/* Salon dropdown */}
                <select name="salon_id" value={form.salon_id} onChange={handleChange} required>
                  <option value="">-- Select Salon --</option>
                  {salons.map(salon => (
                    <option key={salon.salon_id} value={salon.salon_id}>{salon.salon_name}</option>
                  ))}
                </select>

                {/* Branch dropdown */}
                <select name="branch_id" value={form.branch_id} onChange={handleChange}>
                  <option value="">Main Salon</option>
                  {branches[form.salon_id]?.map(b => (
                    <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                  ))}
                </select>

                <input type="text" name="staff_role" placeholder="Staff Role / Speciality" value={form.staff_role} onChange={handleChange} required />
                <select name="staff_status" value={form.staff_status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button type="submit">{editingStaffId ? "Update Staff" : "Add Staff"}</button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
export default OwnerStaff;