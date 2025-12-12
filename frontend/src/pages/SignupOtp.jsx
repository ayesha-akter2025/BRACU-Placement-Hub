import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function SignupOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const tempUser = JSON.parse(localStorage.getItem("tempUser"));

  if (!tempUser) navigate("/signup");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/verify-signup-otp", {
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        otp,
      });

      localStorage.removeItem("tempUser");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "OTP verification failed");
    }
  };

  return (
    <div className="container">
      <h1>Verify OTP</h1>
      <p>OTP sent to {tempUser.email}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter OTP"
          value={otp} onChange={(e) => setOtp(e.target.value)} required />

        <button type="submit">Verify</button>
      </form>
    </div>
  );
}
