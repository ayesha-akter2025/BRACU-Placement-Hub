// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    // --- UPDATED VALIDATION LOGIC ---
    validate: {
      validator: function(v) {
        // 1. Basic email format check (regex)
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(v)) return false;

        // 2. Logic: If role is 'student', MUST use @g.bracu.ac.bd
        // Note: We use 'this.role' to check the user's role
        if (this.role === "student") {
          return v.endsWith("@g.bracu.ac.bd");
        }

        // 3. If role is 'recruiter', allow any valid email (Gmail, Outlook, etc.)
        return true; 
      },
      message: props => "Invalid email. Students must use @g.bracu.ac.bd domain."
    }
    // --------------------------------
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["student", "recruiter", "admin"], 
    default: "student" 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);