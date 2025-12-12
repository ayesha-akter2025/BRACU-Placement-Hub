// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  
  // Form State
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    role: "student" // Default role
  });

  // UI State
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Send Signup Data to Backend
      await api.post("/auth/signup", form);
      
      // 2. Alert the user
      alert("Verification code sent to your email!");

      // 3. CRITICAL CHANGE: Redirect to Verify OTP page
      // We pass the email in 'state' so the Verify page can pre-fill it
      navigate("/verify-otp", { state: { email: form.email } });

    } catch (err) {
      // Handle Errors
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h1>Create Account</h1>
        
        {error && <p className="error">{error}</p>}
        
        <input 
          type="text" 
          name="name" 
          placeholder="Full Name" 
          value={form.name} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email (@g.bracu.ac.bd)" 
          value={form.email} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password (min 6 characters)" 
          value={form.password} 
          onChange={handleChange} 
          minLength="6"
          required 
        />
        
        <select 
          name="role" 
          value={form.role} 
          onChange={handleChange}
          required
        >
          <option value="student">Student</option>
          <option value="recruiter">Recruiter/Company</option>
        </select>
        
        <button type="submit" disabled={loading}>
          {loading ? "Sending OTP..." : "Sign Up"}
        </button>
        
        <p>
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
}