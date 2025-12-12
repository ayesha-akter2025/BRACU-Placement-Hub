// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./Login.css"; // Assumes you have basic styling here

export default function Login() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    email: "", 
    password: "" 
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Send Login Request
      const res = await api.post("/auth/login", form);
      
      // 2. Save Token and User Data to LocalStorage
      // The backend returns: { msg, token, user: { id, name, email, role } }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // 3. ROLE-BASED REDIRECT
      // Check the role inside the response data
      if (res.data.user.role === "recruiter") {
        // Recruiters go to their Job Management Dashboard
        navigate("/jobs/manage");
      } else {
        // Students go to the main Student Dashboard
        navigate("/dashboard");
      }

    } catch (err) {
      // Handle Errors (e.g., Invalid credentials, User not found)
      setError(err.response?.data?.msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Welcome Back</h1>
        <p className="subtitle">Login to BRACU Placement Hub</p>
        
        {error && <p className="error">{error}</p>}
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={handleChange} 
          required 
        />
        
        <div className="forgot-password">
          <span onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </span>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <p className="footer-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </form>
    </div>
  );
}