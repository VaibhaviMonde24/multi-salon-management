import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/customer/BookAppointment.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function BookAppointment() {
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();

  const [salons, setSalons] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [formData, setFormData] = useState({
    salon_id: "",
    branch_id: "",
    service_id: "",
    staff_id: "",
    appointment_datetime: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // -------------------------
  // Fetch all approved salons
  // -------------------------
  useEffect(() => {
    fetch(`${API_URL}/api/salons/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.salons)) {
          setSalons(data.salons);

          // ✅ URL मधून salon_id घे आणि automatic select कर
          const salonIdFromUrl = searchParams.get("salon_id");
          if (salonIdFromUrl) {
            setFormData((prev) => ({ ...prev, salon_id: salonIdFromUrl }));
          }
        } else {
          setSalons([]);
        }
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
      setFormData((prev) => ({ ...prev, branch_id: "", service_id: "", staff_id: "" }));
      return;
    }

    fetch(`${API_URL}/api/salons/${formData.salon_id}/branches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setBranches(data.data);
        else setBranches([]);
        setFormData((prev) => ({ ...prev, branch_id: "" }));
      })
      .catch((err) => {
        console.error("Error fetching branches:", err);
        setBranches([]);
      });
  }, [formData.salon_id, token]);

  // -------------------------
  // Fetch services when salon changes
  // -------------------------
  useEffect(() => {
    if (!formData.salon_id) {
      setServices([]);
      setFormData((prev) => ({ ...prev, service_id: "" }));
      return;
    }

    fetch(`${API_URL}/api/customer/salons/${formData.salon_id}/services`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setServices(data.data);
        else setServices([]);
        setFormData((prev) => ({ ...prev, service_id: "" }));
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setServices([]);
      });
  }, [formData.salon_id, token]);

  // -------------------------
  // Fetch staff when salon changes
  // -------------------------
  useEffect(() => {
    if (!formData.salon_id) {
      setStaffList([]);
      setFormData((prev) => ({ ...prev, staff_id: "" }));
      return;
    }

    fetch(`${API_URL}/api/staff/salon/${formData.salon_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setStaffList(data.data);
        else setStaffList([]);
        setFormData((prev) => ({ ...prev, staff_id: "" }));
      })
      .catch((err) => {
        console.error("Error fetching staff:", err);
        setStaffList([]);
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

    if (!formData.salon_id || !formData.service_id || !formData.appointment_datetime) {
      setMessage({ text: "Please fill required fields: Salon, Service, Date & Time.", type: "error" });
      return;
    }

    // Past date check
    const selectedDate = new Date(formData.appointment_datetime);
    if (selectedDate < new Date()) {
      setMessage({ text: "Please select a future date and time.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    fetch(`${API_URL}/api/appointments/book`, {
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
          setMessage({ text: "Appointment booked successfully! ✅", type: "success" });
          setFormData({
            salon_id: "",
            branch_id: "",
            service_id: "",
            staff_id: "",
            appointment_datetime: "",
            notes: "",
          });
          setBranches([]);
          setServices([]);
          setStaffList([]);
        } else {
          setMessage({ text: data.message || "Failed to book appointment.", type: "error" });
        }
      })
      .catch((err) => {
        console.error("Error booking appointment:", err);
        setMessage({ text: "Something went wrong. Please try again.", type: "error" });
      })
      .finally(() => setLoading(false));
  };

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

        {/* Success / Error Message */}
        {message.text && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "14px",
            backgroundColor: message.type === "success" ? "#e8f5e9" : "#fdecea",
            color: message.type === "success" ? "#2e7d32" : "#c62828",
            fontWeight: "500",
            fontSize: "14px",
          }}>
            {message.text}
          </div>
        )}

        {/* Salon selection */}
        <label>Select Salon *</label>
        <select
          name="salon_id"
          value={formData.salon_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Salon --</option>
          {salons.map((s) => (
            <option key={s.salon_id} value={s.salon_id}>
              {s.salon_name} ({s.city})
            </option>
          ))}
        </select>

        {/* Branch selection */}
        {branches.length > 0 && (
          <>
            <label>Select Branch (optional)</label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
            >
              <option value="">-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Service selection */}
        <label>Select Service *</label>
        <select
          name="service_id"
          value={formData.service_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Service --</option>
          {services.map((s) => (
            <option key={s.service_id} value={s.service_id}>
              {s.service_name} (₹{parseInt(s.service_price)}) — {s.service_duration} mins
            </option>
          ))}
        </select>

        {/* Staff selection */}
        <label>Select Staff (optional)</label>
        <select
          name="staff_id"
          value={formData.staff_id}
          onChange={handleChange}
        >
          <option value="">-- Any Available Staff --</option>
          {staffList.length > 0 ? (
            staffList.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.staff_name} — {staff.staff_role}
              </option>
            ))
          ) : (
            formData.salon_id && <option disabled>No staff found for this salon</option>
          )}
        </select>

        {/* Date & Time */}
        <label>Date & Time *</label>
        <input
          type="datetime-local"
          name="appointment_datetime"
          value={formData.appointment_datetime}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 16)}
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

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}

export default BookAppointment;