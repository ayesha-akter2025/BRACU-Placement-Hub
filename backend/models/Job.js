import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  skills: { type: [String], required: true }, // Array of strings
  type: { type: String, enum: ["Full-time", "Part-time", "Internship"], default: "Full-time" },
  status: { type: String, enum: ["Open", "Filled"], default: "Open" },
  
  // Link the job to the Recruiter who posted it
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);