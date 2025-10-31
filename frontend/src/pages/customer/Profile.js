// src/pages/customer/Profile.js
import React, { useState, useEffect } from "react";
import "../../styles/customer/Profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProfile({
          username: data.user.username || "",
          email: data.user.email || "",
          phone_number: data.user.phone_number || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError("Failed to load profile.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: profile.username,
          phone_number: profile.phone_number,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Update failed");
      }
      const data = await res.json();
      alert(data.message || "Profile updated successfully");
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div
      className="profile-page"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
        background: `url('/images/salonreg.jpeg') no-repeat center center/cover`,
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "500px" }}>
        <h2>My Profile</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleUpdate} className="profile-form">
          <label>Username</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) =>
              setProfile({ ...profile, username: e.target.value })
            }
          />

          <label>Email</label>
          <input type="email" value={profile.email} readOnly />

          <label>Phone</label>
          <input
            type="text"
            value={profile.phone_number}
            onChange={(e) =>
              setProfile({ ...profile, phone_number: e.target.value })
            }
          />

          <button type="submit">Update Profile</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
