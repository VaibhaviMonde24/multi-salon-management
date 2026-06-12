import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      setError("Email or phone and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmedIdentifier, password: trimmedPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Something went wrong during login.");
        return;
      }

      // ✅ Token save करा
      localStorage.setItem("token", data.token);

      // ✅ redirectSalonId check करा
      const redirectSalonId = localStorage.getItem("redirectSalonId");

      if (data.user.role === "Customer" && redirectSalonId) {
        // Salon वरून आलेला Customer → Book Appointment वर पाठव
        localStorage.removeItem("redirectSalonId");
        navigate(`/customer/book-appointment?salon_id=${redirectSalonId}`);
      } else if (data.user.role === "Customer") {
        navigate("/customer/dashboard");
      } else if (data.user.role === "SalonOwner") {
        navigate("/owner/dashboard");
      } else if (data.user.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login Error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
      }}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {/* ✅ Error Message */}
        {error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "14px",
            backgroundColor: "#fdecea",
            color: "#c62828",
            fontWeight: "500",
            fontSize: "14px",
          }}>
            ⚠️ {error}
          </div>
        )}

        <label>Email or Phone</label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your email or phone"
          required
        />

        <label>Password</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="forgot-password">
          <button
            type="button"
            className="link-button"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>

        {/* ✅ Loading state */}
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account?{" "}
          <span className="link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          <span
            className="link"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer", color: "#ff4081" }}
          >
            &larr; Back to Home
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;