// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // create this CSS file

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
