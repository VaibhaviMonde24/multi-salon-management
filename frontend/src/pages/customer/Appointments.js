// src/pages/customer/Appointments.jsx
import React, { useEffect, useState, useCallback } from "react";
import { FaTimes, FaRedo } from "react-icons/fa";
import "../../styles/customer/Appointments.css";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch appointments
  const fetchAppointments = useCallback(() => {
    fetch("http://localhost:5000/api/appointments/my-appointments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAppointments(data.data);
      })
      .catch((err) => console.error("Error fetching appointments:", err));
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Cancel appointment
  const cancelAppointment = (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    fetch(`http://localhost:5000/api/appointments/cancel/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) fetchAppointments();
        else alert(data.message);
      })
      .catch((err) => console.error(err));
  };

  // Reschedule appointment
  const rescheduleAppointment = (id) => {
    const newDate = prompt("Enter new date and time (YYYY-MM-DD HH:MM):");
    if (!newDate) return;

    fetch(`http://localhost:5000/api/appointments/reschedule/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ appointment_datetime: newDate }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) fetchAppointments();
        else alert(data.message);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div
      className="appointments-page"
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: `url('/images/salonreg.jpeg') no-repeat center center/cover`,
      }}
    >
      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <h2>My Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments booked yet.</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Staff</th>
                <th>Salon</th>
                <th>Branch</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.appointment_id}>
                  <td data-label="Service">{appt.service_name}</td>
                  <td data-label="Staff">{appt.staff_name || "N/A"}</td>
                  <td data-label="Salon">{appt.salon_name}</td>
                  <td data-label="Branch">{appt.branch_name || "N/A"}</td>
                  <td data-label="Date & Time">
                    {new Date(appt.appointment_datetime).toLocaleString()}
                  </td>
                  <td
                    data-label="Status"
                    className={`status ${appt.status.toLowerCase()}`}
                  >
                    {appt.status}
                  </td>
                  <td data-label="Actions">
                    {appt.status === "Booked" && (
                      <>
                        <button
                          onClick={() => cancelAppointment(appt.appointment_id)}
                        >
                          <FaTimes /> Cancel
                        </button>
                        <button
                          onClick={() => rescheduleAppointment(appt.appointment_id)}
                        >
                          <FaRedo /> Reschedule
                        </button>
                      </>
                    )}
                    {appt.status === "Completed" && <span>Completed</span>}
                    {appt.status === "Cancelled" && <span>Cancelled</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Appointments;
