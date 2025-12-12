// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Login.css"; 

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Send request to backend
      await api.post("/auth/forgot-password", { email });

      alert("OTP sent to your email!");

      // -----------------------------------------------------------
      // THIS WAS THE BUG:
      // Old (Wrong): navigate("/verify-otp", { state: { email } });
      // New (Correct): Navigate to the RESET page
      // -----------------------------------------------------------
      navigate("/reset-password", { state: { email } }); 

    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Forgot Password</h1>
        <p className="subtitle">Enter your email to receive a reset code</p>
        {error && <p className="error">{error}</p>}
        <input 
          type="email" 
          placeholder="Enter your registered email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}