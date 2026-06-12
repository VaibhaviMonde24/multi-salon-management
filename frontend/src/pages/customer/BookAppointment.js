import React, { useState, useEffect } from "react";
import "../../styles/customer/BookAppointment.css";

function BookAppointment() {
  const token = localStorage.getItem("token");

  const [salons, setSalons] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    salon_id: "",
    branch_id: "",
    service_id: "",
    staff_id: "",
    appointment_datetime: "",
    notes: "",
  });

  // -------------------------
  // Fetch all approved salons
  // -------------------------
  useEffect(() => {
    fetch("http://localhost:5000/api/salons/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.salons)) setSalons(data.salons);
        else setSalons([]);
      })
      .catch((err) => {
        console.error("Error fetching salons:", err);
        setSalons([]);
      });
  }, [token]);

  // -------------------------
  // Fetch branches when salon changes
  // -------------------------
  useEffect(() => {
    if (!formData.salon_id) {
      setBranches([]);
      setFormData((prev) => ({ ...prev, branch_id: "" }));
      return;
    }

    fetch(`http://localhost:5000/api/salons/${formData.salon_id}/branches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setBranches(data.data);
        else setBranches([]);
        setFormData((prev) => ({ ...prev, branch_id: "" })); // reset branch selection
      })
      .catch((err) => {
        console.error("Error fetching branches:", err);
        setBranches([]);
      });
  }, [formData.salon_id, token]);

  // -------------------------
  // Fetch services for selected salon
  // -------------------------
  useEffect(() => {
    if (!formData.salon_id) {
      setServices([]);
      setFormData((prev) => ({ ...prev, service_id: "" }));
      return;
    }

    fetch(`http://localhost:5000/api/customer/salons/${formData.salon_id}/services`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setServices(data.data);
        else setServices([]);
        setFormData((prev) => ({ ...prev, service_id: "" })); // reset service selection
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setServices([]);
      });
  }, [formData.salon_id, token]);

  // -------------------------
  // Handle input changes
  // -------------------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // -------------------------
  // Handle form submission
  // -------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.salon_id || !formData.service_id || !formData.appointment_datetime) {
      alert("Please fill required fields: Salon, Service, Date & Time.");
      return;
    }

    fetch("http://localhost:5000/api/appointments/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Appointment booked successfully!");
          // Reset form
          setFormData({
            salon_id: "",
            branch_id: "",
            service_id: "",
            staff_id: "",
            appointment_datetime: "",
            notes: "",
          });
        } else {
          alert(data.message || "Failed to book appointment");
        }
      })
      .catch((err) => console.error("Error booking appointment:", err));
  };

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(252,228,236,0.6), rgba(243,229,245,0.6)), url('/images/salonreg.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "50px 0",
      }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Book Appointment</h2>

        {/* Salon selection */}
        <label>Select Salon</label>
        <select
          name="salon_id"
          value={formData.salon_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Salon</option>
          {salons.map((s) => (
            <option key={s.salon_id} value={s.salon_id}>
              {s.salon_name} ({s.city})
            </option>
          ))}
        </select>

        {/* Branch selection (optional) */}
        {branches.length > 0 && (
          <>
            <label>Select Branch (optional)</label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Service selection */}
        <label>Select Service</label>
        <select
          name="service_id"
          value={formData.service_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option key={s.service_id} value={s.service_id}>
              {s.service_name} (₹{parseInt(s.service_price)})
            </option>
          ))}
        </select>

        {/* Appointment datetime */}
        <label>Date & Time</label>
        <input
          type="datetime-local"
          name="appointment_datetime"
          value={formData.appointment_datetime}
          onChange={handleChange}
          required
        />

        {/* Notes */}
        <label>Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          placeholder="Any special requests..."
        />

        <button type="submit" className="auth-btn">
          Book Appointment
        </button>
      </form>
    </div>
  );
}

export default BookAppointment;