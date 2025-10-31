import React, { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setStatus(data.msg); //  matches backend { success, msg }
        setFormData({ name: "", email: "", message: "" }); // reset form
      } else {
        setStatus(data.msg || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>

      {/* Contact Info Section */}
      <div className="contact-info">
        <p>
          <FaMapMarkerAlt /> 123 Main St, Your City
        </p>
        <p>
          <FaPhoneAlt /> +123-456-7890
        </p>
        <p>
          <FaEnvelope /> info@salonhub.com
        </p>
      </div>

      {/* Contact Form */}
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          rows="6"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Send Message</button>
      </form>

      {/* Status Message */}
      {status && <p className="form-status">{status}</p>}
    </div>
  );
}

export default Contact;
