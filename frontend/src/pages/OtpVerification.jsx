// src/pages/OtpVerification.jsx (FIXED)
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import "./OtpVerification.css";

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const type = location.state?.type || "signup"; // "signup" or "reset"

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (type === "signup") {
        // Verify OTP for signup
        const res = await api.post("/auth/verify-otp", { email, otp });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else if (type === "reset") {
        // Verify OTP for password reset
        const res = await api.post("/auth/verify-reset-otp", { email, otp });
        navigate("/reset-password", { 
          state: { resetToken: res.data.resetToken } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown

    try {
      await api.post("/auth/resend-otp", { email });
      alert("New OTP sent to your email");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend OTP");
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="otp-container">
      <form onSubmit={handleSubmit} className="otp-form">
        <div className="otp-icon">✉️</div>
        <h1>Verify Your Email</h1>
        <p className="otp-message">
          We've sent a 6-digit verification code to<br />
          <strong>{email}</strong>
        </p>
        
        {error && <p className="error">{error}</p>}
        
        <input
          type="text"
          name="otp"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength="6"
          required
          autoFocus
        />
        
        <button type="submit" disabled={loading || otp.length !== 6}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        
        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendDisabled}
            className="resend-btn"
          >
            {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </div>

        <p className="back-link">
          <span onClick={() => navigate(type === "reset" ? "/forgot-password" : "/signup")}>
            ← Go Back
          </span>
        </p>
      </form>
    </div>
  );
}