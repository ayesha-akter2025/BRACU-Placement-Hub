// ========================================
// 5. backend/models/Review.js
// ========================================
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  companyName: { type: String, required: true },
  reviewerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  reviewerName: { type: String, required: true },
  ratings: {
    workCulture: { type: Number, min: 1, max: 5, required: true },
    salary: { type: Number, min: 1, max: 5, required: true },
    careerGrowth: { type: Number, min: 1, max: 5, required: true },
    overall: { type: Number, min: 1, max: 5 }
  },
  reviewText: { type: String, required: true, maxlength: 1000 },
  position: String,
  employmentStatus: { 
    type: String, 
    enum: ["Current", "Former", "Intern"],
    required: true 
  },
  pros: String,
  cons: String,
  isVisible: { type: Boolean, default: true },
  flaggedForReview: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.pre("save", function(next) {
  const { workCulture, salary, careerGrowth } = this.ratings;
  this.ratings.overall = Math.round((workCulture + salary + careerGrowth) / 3 * 10) / 10;
  next();
});

export default mongoose.model("Review", reviewSchema);