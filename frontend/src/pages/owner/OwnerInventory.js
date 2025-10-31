// src/pages/owner/OwnerInventory.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSignOutAlt, FaBoxes, FaHome, FaUsers, FaCut, FaCalendarAlt,  FaDollarSign, FaBell, FaStar, FaChartBar, FaPlusCircle} from "react-icons/fa";
import "../../styles/owner/OwnerInventory.css";

const OwnerInventory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [inventory, setInventory] = useState([]);
  const [product, setProduct] = useState({
    salon_id: "",
    product_name: "",
    product_quantity: "",
    product_price: "",
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

  // Fetch inventory
  const fetchInventory = useCallback(async (salonId) => {
    if (!salonId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/owner/inventory/${salonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setInventory(res.data.products || []);
      }
    } catch (err) {
      console.error("Fetch inventory error:", err);
    }
  }, [token]);

  // Add new product
  const handleAdd = async (e) => {
    e.preventDefault();
    const { salon_id, product_name, product_quantity, product_price } = product;

    if (!salon_id || !product_name || !product_quantity || !product_price) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/owner/inventory",
        { salon_id, product_name, product_quantity, product_price },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        fetchInventory(salon_id);
        setProduct({ ...product, product_name: "", product_quantity: "", product_price: "" });
      }
    } catch (err) {
      console.error("Add product error:", err);
    }
  };

  // Calculate live total
  const liveTotalValue = () => {
    const qty = Number(product.product_quantity) || 0;
    const price = Number(product.product_price) || 0;
    return (qty * price).toFixed(2);
  };

  // Fetch inventory whenever salon_id changes
  useEffect(() => {
    if (product.salon_id) fetchInventory(product.salon_id);
  }, [product.salon_id, fetchInventory]);

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
              className={`sidebar-item ${item.path === "/owner/inventory" ? "active" : ""}`}
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
        <h2>Inventory Management</h2>

        {/* Add Product Form */}
        <form className="inventory-form" onSubmit={handleAdd}>
          <input
            placeholder="Salon ID"
            value={product.salon_id}
            onChange={(e) => setProduct({ ...product, salon_id: e.target.value })}
          />
          <input
            placeholder="Product Name"
            value={product.product_name}
            onChange={(e) => setProduct({ ...product, product_name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={product.product_quantity}
            onChange={(e) => setProduct({ ...product, product_quantity: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price per Unit"
            value={product.product_price}
            onChange={(e) => setProduct({ ...product, product_price: e.target.value })}
          />
          <div className="live-total">
            Total Value: <strong>{liveTotalValue()}</strong>
          </div>
          <button type="submit">Add</button>
        </form>

        {/* Inventory Table */}
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Price per Unit</th>
              <th>Total Value</th>
              <th>Salon ID</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="5">No items available</td>
              </tr>
            ) : (
              inventory.map((i) => (
                <tr key={i.inventory_id}>
                  <td>{i.product_name}</td>
                  <td>{i.product_quantity}</td>
                  <td>{Number(i.product_price).toFixed(2)}</td>
                  <td>{(i.product_quantity * i.product_price).toFixed(2)}</td>
                  <td>{i.salon_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default OwnerInventory;
