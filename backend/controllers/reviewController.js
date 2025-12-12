// ========================================
// 10. backend/controllers/reviewController.js
// ========================================
import Review from "../models/Review.js";
import User from "../models/User.js";

export const createReview = async (req, res) => {
  try {
    const { companyId, ratings, reviewText, position, employmentStatus, pros, cons } = req.body;

    const company = await User.findById(companyId);
    if (!company || company.role !== "recruiter") {
      return res.status(404).json({ msg: "Company not found" });
    }

    const existingReview = await Review.findOne({ 
      companyId, 
      reviewerId: req.user._id 
    });

    if (existingReview) {
      return res.status(400).json({ msg: "You have already reviewed this company" });
    }

    const review = await Review.create({
      companyId,
      companyName: company.name,
      reviewerId: req.user._id,
      reviewerName: req.user.name,
      ratings,
      reviewText,
      position,
      employmentStatus,
      pros,
      cons
    });

    res.status(201).json({ msg: "Review posted successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;

    const reviews = await Review.find({ 
      companyId, 
      isVisible: true 
    })
      .sort({ createdAt: -1 })
      .populate("reviewerId", "name");

    const aggregate = await Review.aggregate([
      { $match: { companyId: mongoose.Types.ObjectId(companyId), isVisible: true } },
      {
        $group: {
          _id: null,
          avgWorkCulture: { $avg: "$ratings.workCulture" },
          avgSalary: { $avg: "$ratings.salary" },
          avgCareerGrowth: { $avg: "$ratings.careerGrowth" },
          avgOverall: { $avg: "$ratings.overall" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = aggregate[0] || {
      avgWorkCulture: 0,
      avgSalary: 0,
      avgCareerGrowth: 0,
      avgOverall: 0,
      totalReviews: 0
    };

    res.json({ reviews, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("companyId", "name");

    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized to update this review" });
    }

    const { ratings, reviewText, position, employmentStatus, pros, cons } = req.body;

    if (ratings) review.ratings = { ...review.ratings, ...ratings };
    if (reviewText) review.reviewText = reviewText;
    if (position) review.position = position;
    if (employmentStatus) review.employmentStatus = employmentStatus;
    if (pros) review.pros = pros;
    if (cons) review.cons = cons;

    await review.save();

    res.json({ msg: "Review updated successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized to delete this review" });
    }

    await Review.deleteOne({ _id: req.params.id });

    res.json({ msg: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
