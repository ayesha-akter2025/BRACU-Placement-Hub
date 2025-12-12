import express from "express";
import { createJob, getMyJobs, updateJob, deleteJob } from "../controllers/jobController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Apply 'protect' to all routes (User must be logged in)
// Apply 'restrictTo("recruiter")' to ensure only recruiters can access
router.post("/", protect, restrictTo("recruiter"), createJob);
router.get("/my-jobs", protect, restrictTo("recruiter"), getMyJobs);
router.put("/:id", protect, restrictTo("recruiter"), updateJob);
router.delete("/:id", protect, restrictTo("recruiter"), deleteJob);

export default router;