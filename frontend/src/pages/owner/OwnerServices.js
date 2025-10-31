// File: src/pages/owner/OwnerServices.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {FaHome,FaCalendarAlt,FaBell,FaStar,FaSignOutAlt,FaPlusCircle,FaDollarSign,FaChartBar,FaUsers,FaCut, FaBoxes, FaEdit,FaTrash,} from "react-icons/fa";
import "../../styles/owner/OwnerServices.css";

function OwnerServices() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [services, setServices] = useState([]);
  const [salons, setSalons] = useState([]);
  const [newService, setNewService] = useState({
    salon_id: "",
    name: "",
    price: "",
    duration: "",
    description: "",
  });
  const [editingService, setEditingService] = useState(null);

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

  // Fetch all services (for the selected salon)
  const fetchServices = useCallback(() => {
    if (!newService.salon_id) return; // only fetch if a salon is selected
    fetch(`http://localhost:5000/api/services/salon/${newService.salon_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data || []);
      })
      .catch((err) => console.error("Fetch services error:", err));
  }, [token, newService.salon_id]);

  // Fetch all salons owned by the user
  const fetchSalons = useCallback(() => {
    fetch("http://localhost:5000/api/owner/salons", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSalons(data.data || []);
      });
  }, [token]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Add or Update service
  const handleSubmit = (e) => {
    e.preventDefault();
    const { salon_id, name, price, duration } = newService;
    if (!salon_id || !name || !price || !duration) return;

    const url = editingService
      ? `http://localhost:5000/api/services/${editingService.service_id}`
      : "http://localhost:5000/api/services";
    const method = editingService ? "PUT" : "POST";

    const payload = {
      salon_id: newService.salon_id,
      service_name: newService.name,
      service_price: newService.price,
      service_duration: newService.duration,
      service_description: newService.description || "",
    };

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchServices();
          setNewService({
            salon_id: newService.salon_id, // keep salon selected
            name: "",
            price: "",
            duration: "",
            description: "",
          });
          setEditingService(null);
        } else alert(data.message || "Something went wrong");
      })
      .catch((err) => console.error("Service submit error:", err));
  };

  // Edit service
  const handleEdit = (service) => {
    setEditingService(service);
    setNewService({
      salon_id: service.salon_id,
      name: service.service_name,
      price: service.service_price,
      duration: service.service_duration,
      description: service.service_description || "",
    });
  };

  // Delete service
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    fetch(`http://localhost:5000/api/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) fetchServices();
      })
      .catch((err) => console.error("Delete service error:", err));
  };

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
                item.path === "/owner/services" ? "active" : ""
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

      {/* Main Content */}
      <main className="main-content">
        <div className="owner-services">
          <h1>Manage Services</h1>

          <form className="service-form" onSubmit={handleSubmit}>
            <select
              value={newService.salon_id}
              onChange={(e) =>
                setNewService({ ...newService, salon_id: e.target.value })
              }
              required
            >
              <option value="">Select Salon</option>
              {salons.map((s) => (
                <option key={s.salon_id} value={s.salon_id}>
                  {s.salon_name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Service Name"
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={newService.price}
              onChange={(e) =>
                setNewService({ ...newService, price: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={newService.duration}
              onChange={(e) =>
                setNewService({ ...newService, duration: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Description (optional)"
              value={newService.description}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
            />

            <button type="submit">
              {editingService ? "Update Service" : "Add Service"}
            </button>
          </form>

          <div className="services-list">
            {services.map((service) => (
              <div key={service.service_id} className="service-card">
                <h3>{service.service_name}</h3>
                <p>
                  ₹ {service.service_price} | {service.service_duration} min
                </p>
                <div className="service-actions">
                  <FaEdit onClick={() => handleEdit(service)} />
                  <FaTrash onClick={() => handleDelete(service.service_id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
export default OwnerServices;