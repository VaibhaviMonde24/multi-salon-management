// src/pages/owner/OwnerSalons.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaBell, FaEnvelope, FaStar, FaSignOutAlt, FaPlusCircle, FaDollarSign, FaChartBar, FaUsers, FaCut, FaBoxes } from "react-icons/fa";
import "../../styles/owner/OwnerSalons.css";

function OwnerSalons() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [salons, setSalons] = useState([]);
  const [newSalon, setNewSalon] = useState({
    salon_name: "",
    salon_address: "",
    salon_phone_number: "",
    salon_email: "",
    salon_description: "",
    salon_logo: "",
    city: "",
    category: "",
    is_main: false,
  });
  const [editingSalonId, setEditingSalonId] = useState(null);
  const [mainSalonExists, setMainSalonExists] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/owner/dashboard" },
    { name: "Salons", icon: <FaPlusCircle />, path: "/owner/salons" },
    { name: "Services", icon: <FaCut />, path: "/owner/services" },
    { name: "Staff", icon: <FaUsers />, path: "/owner/staff" },
    { name: "Inventory", icon: <FaBoxes />, path: "/owner/inventory" },
    { name: "Appointments", icon: <FaCalendarAlt />, path: "/owner/appointments" },
    { name: "Payments", icon: <FaDollarSign />, path: "/owner/payments" },
    { name: "Notifications", icon: <FaBell />, path: "/owner/notifications" },
    { name: "Messages", icon: <FaEnvelope />, path: "/owner/messages" },
    { name: "Reviews", icon: <FaStar />, path: "/owner/reviews" },
    { name: "Reports", icon: <FaChartBar />, path: "/owner/reports" },
  ];

  // Fetch salons and check for main salon
  const fetchSalons = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/owner/salons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSalons(data.data || []);
        // Check if a main salon exists
        const mainSalon = data.data?.find(salon => salon.is_main);
        setMainSalonExists(!!mainSalon);
      } else {
        setSalons([]);
        setMainSalonExists(false);
      }
    } catch (error) {
      console.error("Error fetching salons:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSalon({ ...newSalon, [name]: type === "checkbox" ? checked : value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSalonId
        ? `http://localhost:5000/api/owner/salons/${editingSalonId}`
        : "http://localhost:5000/api/owner/salons";
      const method = editingSalonId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSalon),
      });

      const data = await response.json();
      if (data.success) {
        fetchSalons();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving salon:", error);
    }
  };

  const resetForm = () => {
    setNewSalon({
      salon_name: "",
      salon_address: "",
      salon_phone_number: "",
      salon_email: "",
      salon_description: "",
      salon_logo: "",
      city: "",
      category: "",
      is_main: false,
    });
    setEditingSalonId(null);
  };

  // Handle edit
  const handleEdit = (salon) => {
    setNewSalon(salon);
    setEditingSalonId(salon.salon_id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/owner/salons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSalons();
    } catch (error) {
      console.error("Error deleting salon:", error);
    }
  };

  // Logout
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
              className={`sidebar-item ${item.path === "/owner/salons" ? "active" : ""}`}
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
        <h2>My Salons</h2>

        {/* Salon/Branch Form */}
        <form onSubmit={handleSubmit} className="salon-form">
          <div className="form-row">
            <input
              type="text"
              name="salon_name"
              placeholder="Salon Name"
              value={newSalon.salon_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="salon_address"
              placeholder="Address"
              value={newSalon.salon_address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="salon_phone_number"
              placeholder="Phone Number"
              value={newSalon.salon_phone_number}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="salon_email"
              placeholder="Email"
              value={newSalon.salon_email}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={newSalon.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={newSalon.category}
              onChange={handleChange}
            />
          </div>

          <input
            type="text"
            name="salon_logo"
            placeholder="Logo URL"
            value={newSalon.salon_logo}
            onChange={handleChange}
          />
          <textarea
            name="salon_description"
            placeholder="Description"
            value={newSalon.salon_description}
            onChange={handleChange}
          />

          {/* Main Salon Checkbox */}
          <label>
            <input
              type="checkbox"
              name="is_main"
              checked={newSalon.is_main}
              onChange={handleChange}
              disabled={mainSalonExists && !newSalon.is_main} // disable if main salon exists
            />
            Main Salon
          </label>

          <button type="submit">
            {editingSalonId ? "Update" : mainSalonExists ? "Add Branch" : "Add Salon"}
          </button>
        </form>

        {/* Salon List */}
        <h3>Existing Salons & Branches</h3>
        {salons.length === 0 ? (
          <p>No salons found.</p>
        ) : (
          <div className="salon-list">
            {salons.map((salon) => (
              <div key={salon.salon_id} className="salon-item">
                {salon.salon_logo && <img src={salon.salon_logo} alt={salon.salon_name} className="salon-logo" />}
                <div className="salon-info">
                  <h4>{salon.salon_name} {salon.is_main ? "(Main)" : "(Branch)"}</h4>
                  <p>{salon.salon_address}</p>
                  <p>{salon.city}</p>
                  <p>{salon.salon_phone_number}</p>

                  {/* Branches */}
                  {salon.branches && salon.branches.length > 0 && (
                    <div className="branches-list">
                      <h5>Branches:</h5>
                      {salon.branches.map(branch => (
                        <div key={branch.branch_id} className="branch-item">
                          <p>{branch.branch_name} - {branch.address}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="salon-actions">
                    <button onClick={() => handleEdit(salon)}>Edit</button>
                    <button onClick={() => handleDelete(salon.salon_id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default OwnerSalons;
