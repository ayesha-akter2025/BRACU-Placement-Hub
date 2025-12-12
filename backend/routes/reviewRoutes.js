// ========================================
// backend/routes/reviewRoutes.js
// ========================================
import express from "express";
import {
  createReview,
  getCompanyReviews,
  getMyReviews,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js"; // <--- FIXED IMPORT

const router = express.Router();

router.post("/", protect, createReview);          // <--- FIXED USAGE
router.get("/company/:companyId", getCompanyReviews); // Public route (usually)
router.get("/my-reviews", protect, getMyReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;