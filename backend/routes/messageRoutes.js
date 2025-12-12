// ========================================
// backend/routes/messageRoutes.js
// ========================================
import express from "express";
import {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  markAsRead,
  deleteMessage
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js"; // <--- FIXED IMPORT

const router = express.Router();

router.post("/", protect, sendMessage);           // <--- FIXED USAGE
router.get("/conversations", protect, getConversations);
router.get("/unread-count", protect, getUnreadCount);
router.get("/:userId", protect, getConversation);
router.patch("/:messageId/read", protect, markAsRead);
router.delete("/:messageId", protect, deleteMessage);

export default router;