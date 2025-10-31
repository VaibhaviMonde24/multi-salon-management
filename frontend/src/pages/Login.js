import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      alert("Email or phone and password are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmedIdentifier, password: trimmedPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Something went wrong during login.");
        return;
      }

      localStorage.setItem("token", data.token);

      // Redirect based on role
      if (data.user.role === "Customer") {
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
      alert("Something went wrong during login.");
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

        <button type="submit" className="auth-btn">Login</button>

        <p>
          Don’t have an account?{" "}
          <span className="link" onClick={() => navigate("/register")}>
            Register
          </span>
        </p>

        {/* NEW Back to Home Button */}
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
