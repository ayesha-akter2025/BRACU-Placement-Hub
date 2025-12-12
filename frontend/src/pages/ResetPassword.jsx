// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import "./Login.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Get email passed from ForgotPassword page
  const email = location.state?.email;

  // State
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState(""); 
  const [step, setStep] = useState(1); // Step 1 = OTP, Step 2 = Password
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user accesses page directly without email
  if (!email) return <div className="login-container"><p>Error: No email provided.</p></div>;

  // STEP 1: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ---------------------------------------------------------
      // CRITICAL FIX: This uses "verify-reset-otp", NOT "verify-otp"
      // ---------------------------------------------------------
      const res = await api.post("/auth/verify-reset-otp", { email, otp });
      
      setResetToken(res.data.resetToken);
      setStep(2); // Move to Step 2
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Change Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { resetToken, newPassword });
      alert("Success! Login with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Reset Password</h1>
        {error && <p className="error">{error}</p>}

        {step === 1 ? (
          // FORM 1: Enter OTP
          <form onSubmit={handleVerifyOtp}>
            <p>Enter the code sent to {email}</p>
            <input 
              type="text" 
              placeholder="Enter OTP" 
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
            />
            <button disabled={loading}>Verify Code</button>
          </form>
        ) : (
          // FORM 2: Enter New Password
          <form onSubmit={handleResetPassword}>
            <p>Create a New Password</p>
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
            <button disabled={loading}>Change Password</button>
          </form>
        )}
      </div>
    </div>
  );
}