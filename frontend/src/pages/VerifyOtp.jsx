// src/pages/VerifyOtp.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import "./Login.css"; // We can reuse Login styles for consistency

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email passed from the Signup page
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send Email and OTP to backend
      const res = await api.post("/auth/verify-otp", { email, otp });
      
      alert("Verification Successful! You can now login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Verification failed. Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Verify Email</h1>
        <p>Please enter the code sent to your email.</p>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          // If email was passed from signup, make it read-only
          readOnly={!!location.state?.email} 
        />

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify Account"}
        </button>
      </form>
    </div>
  );
}