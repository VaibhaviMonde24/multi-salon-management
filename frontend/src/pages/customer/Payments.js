// src/pages/customer/Payments.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/customer/Payments.css";

function Payments() {
  const [unpaidAppointments, setUnpaidAppointments] = useState([]);
  const [paidAppointments, setPaidAppointments] = useState([]);
  const [loadingUnpaid, setLoadingUnpaid] = useState(true);
  const [loadingPaid, setLoadingPaid] = useState(true);
  const [activeTab, setActiveTab] = useState("unpaid");
  const [selectedMethod, setSelectedMethod] = useState("Online");

  const token = localStorage.getItem("token");

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const unpaidRes = await axios.get(
        "http://localhost:5000/api/customer/unpaid-appointments",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnpaidAppointments(unpaidRes.data.appointments || []);
      setLoadingUnpaid(false);

      const paidRes = await axios.get(
        "http://localhost:5000/api/customer/paid-appointments",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaidAppointments(paidRes.data.appointments || []);
      setLoadingPaid(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoadingUnpaid(false);
      setLoadingPaid(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle payment
  const handlePayNow = async (appointment_id, amount) => {
    const method = window.prompt(
      "Select Payment Method: Card, Cash, UPI, Online",
      selectedMethod
    );
    if (!method) return;
    const chosenMethod = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    setSelectedMethod(chosenMethod);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/customer/make",
        {
          appointment_id,
          amount,
          payment_method: chosenMethod,
          transaction_id: "TXN" + Date.now(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(`Payment successful via ${chosenMethod}!`);
        fetchAppointments();
      } else {
        alert(res.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div
      className="payments-page"
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1200px" }}>
        <h1>Appointments & Payments</h1>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === "unpaid" ? "active" : ""}
            onClick={() => setActiveTab("unpaid")}
          >
            Unpaid
          </button>
          <button
            className={activeTab === "paid" ? "active" : ""}
            onClick={() => setActiveTab("paid")}
          >
            Paid
          </button>
        </div>

        {/* Unpaid */}
        {activeTab === "unpaid" && (
          <div className="appointments-list">
            {loadingUnpaid ? (
              <p>Loading unpaid appointments...</p>
            ) : unpaidAppointments.length === 0 ? (
              <p>No unpaid appointments found.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date & Time</th>
                    <th>Service</th>
                    <th>Salon</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidAppointments.map((appt) => (
                    <tr key={appt.appointment_id}>
                      <td>{appt.appointment_id}</td>
                      <td>{new Date(appt.appointment_datetime).toLocaleString()}</td>
                      <td>{appt.service_name}</td>
                      <td>{appt.salon_name}</td>
                      <td>{appt.amount || "N/A"}</td>
                      <td>
                        <button
                          onClick={() =>
                            handlePayNow(appt.appointment_id, appt.amount || 0)
                          }
                        >
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Paid */}
        {activeTab === "paid" && (
          <div className="appointments-list">
            {loadingPaid ? (
              <p>Loading paid appointments...</p>
            ) : paidAppointments.length === 0 ? (
              <p>No paid appointments found.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date & Time</th>
                    <th>Service</th>
                    <th>Salon</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {paidAppointments.map((appt) => (
                    <tr key={appt.appointment_id}>
                      <td>{appt.appointment_id}</td>
                      <td>{new Date(appt.appointment_datetime).toLocaleString()}</td>
                      <td>{appt.service_name}</td>
                      <td>{appt.salon_name}</td>
                      <td>{appt.amount || "N/A"}</td>
                      <td>{appt.payment_status}</td>
                      <td>{appt.payment_method || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;
