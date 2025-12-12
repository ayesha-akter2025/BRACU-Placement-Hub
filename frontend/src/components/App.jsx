// frontend/src/components/App.jsx (FIXED)
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "../pages/Signup";
import VerifyOtp from "../pages/VerifyOtp"; // Import the file
import Login from "../pages/Login";

import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import JobManagement from "../pages/JobManagement";
import CompanyReviews from "../pages/CompanyReviews";
import Dashboard from "../pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/jobs/manage" element={<JobManagement />} />
        <Route path="/reviews/:companyId" element={<CompanyReviews />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}