// ========================================
// backend/server.js
// ========================================
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => res.send("Backend running"));
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
//console.log("Server running on port ${PORT}"));
process.on("uncaughtException", err => {
console.error("UNCAUGHT ERROR:", err);
});
process.on("unhandledRejection", err => {
console.error("UNHANDLED PROMISE:", err);
});
// ========================================
// backend/.env (EXAMPLE)
// ========================================
/*
MONGO_URI=mongodb://localhost:27017/bracu-placement-hub
JWT_SECRET=your_super_secret_key_change_this
PORT=5000
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-16-character-gmail-app-password
*/