// ========================================
// 6. backend/models/Message.js
// ========================================
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  content: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

export default mongoose.model("Message", messageSchema);