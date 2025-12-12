import express from "express";
import {
  signup,
  verifyOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendOtp,
  me
} from "../controllers/authController.js";

// --- FIX IS HERE: Use curly braces { protect } ---
import { protect } from "../middleware/auth.js"; 
// -----------------------------------------------

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// --- UPDATE USAGE HERE: Use 'protect' instead of 'auth' ---
router.get("/me", protect, me);
// ----------------------------------------------------------

export default router;