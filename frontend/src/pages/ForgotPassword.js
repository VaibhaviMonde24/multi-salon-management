// frontend/src/pages/ForgotPassword.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Something went wrong.");
        return;
      }

      // Show reset link for testing (no email sent)
      if (data.resetLink) {
        alert(`Password reset link generated!\nLink: ${data.resetLink}`);
        navigate(`/reset-password/${data.resetLink.split("/").pop()}`);
      } else {
        alert(data.message || "Password reset instructions generated.");
      }

    } catch (error) {
      console.error("Forgot Password Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(252, 228, 236, 0.6), rgba(243, 229, 245, 0.6)), url('/images/salonreg.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Forgot Password</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0 20px 0",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          className="auth-btn"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#f48fb1",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Send Reset Link
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Remembered your password?{" "}
          <span
            className="link"
            onClick={() => navigate("/login")}
            style={{ color: "#f48fb1", cursor: "pointer" }}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
