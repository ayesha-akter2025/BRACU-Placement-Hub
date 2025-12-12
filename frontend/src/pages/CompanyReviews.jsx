// src/pages/CompanyReviews.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import "./CompanyReviews.css";

export default function CompanyReviews() {
  const { companyId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    workCulture: 3,
    salary: 3,
    careerGrowth: 3,
    reviewText: "",
    position: "",
    employmentStatus: "Current",
    pros: "",
    cons: ""
  });

  useEffect(() => {
    fetchReviews();
  }, [companyId]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/company/${companyId}`);
      setReviews(res.data.reviews);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post("/reviews", {
        companyId,
        ratings: {
          workCulture: parseInt(form.workCulture),
          salary: parseInt(form.salary),
          careerGrowth: parseInt(form.careerGrowth)
        },
        reviewText: form.reviewText,
        position: form.position,
        employmentStatus: form.employmentStatus,
        pros: form.pros,
        cons: form.cons
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Review posted successfully!");
      setShowForm(false);
      fetchReviews();
      
      // Reset form
      setForm({
        workCulture: 3,
        salary: 3,
        careerGrowth: 3,
        reviewText: "",
        position: "",
        employmentStatus: "Current",
        pros: "",
        cons: ""
      });
    } catch (err) {
      alert(err.response?.data?.msg || "Error posting review");
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>Company Reviews</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {stats && (
        <div className="stats-card">
          <div className="overall-rating">
            <h2>{stats.avgOverall.toFixed(1)}</h2>
            <div className="stars">{renderStars(stats.avgOverall)}</div>
            <p>{stats.totalReviews} Reviews</p>
          </div>
          
          <div className="rating-breakdown">
            <div className="rating-item">
              <span>Work Culture</span>
              <div className="rating-bar">
                <div className="fill" style={{ width: `${(stats.avgWorkCulture / 5) * 100}%` }}></div>
              </div>
              <span>{stats.avgWorkCulture.toFixed(1)}</span>
            </div>
            
            <div className="rating-item">
              <span>Salary</span>
              <div className="rating-bar">
                <div className="fill" style={{ width: `${(stats.avgSalary / 5) * 100}%` }}></div>
              </div>
              <span>{stats.avgSalary.toFixed(1)}</span>
            </div>
            
            <div className="rating-item">
              <span>Career Growth</span>
              <div className="rating-bar">
                <div className="fill" style={{ width: `${(stats.avgCareerGrowth / 5) * 100}%` }}></div>
              </div>
              <span>{stats.avgCareerGrowth.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <h2>Write Your Review</h2>
          
          <div className="rating-inputs">
            <div className="rating-input">
              <label>Work Culture: {form.workCulture} ★</label>
              <input
                type="range"
                name="workCulture"
                min="1"
                max="5"
                value={form.workCulture}
                onChange={handleChange}
              />
            </div>

            <div className="rating-input">
              <label>Salary: {form.salary} ★</label>
              <input
                type="range"
                name="salary"
                min="1"
                max="5"
                value={form.salary}
                onChange={handleChange}
              />
            </div>

            <div className="rating-input">
              <label>Career Growth: {form.careerGrowth} ★</label>
              <input
                type="range"
                name="careerGrowth"
                min="1"
                max="5"
                value={form.careerGrowth}
                onChange={handleChange}
              />
            </div>
          </div>

          <input
            type="text"
            name="position"
            placeholder="Your Position/Role"
            value={form.position}
            onChange={handleChange}
            required
          />

          <select
            name="employmentStatus"
            value={form.employmentStatus}
            onChange={handleChange}
            required
          >
            <option value="Current">Current Employee</option>
            <option value="Former">Former Employee</option>
            <option value="Intern">Intern</option>
          </select>

          <textarea
            name="reviewText"
            placeholder="Write your review..."
            value={form.reviewText}
            onChange={handleChange}
            rows="4"
            required
          />

          <textarea
            name="pros"
            placeholder="Pros (optional)"
            value={form.pros}
            onChange={handleChange}
            rows="2"
          />

          <textarea
            name="cons"
            placeholder="Cons (optional)"
            value={form.cons}
            onChange={handleChange}
            rows="2"
          />

          <button type="submit" className="btn-primary">Submit Review</button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="empty-state">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div>
                  <h3>{review.reviewerName}</h3>
                  <p className="review-meta">
                    {review.position} • {review.employmentStatus}
                  </p>
                </div>
                <div className="review-rating">
                  <span className="rating-number">{review.ratings.overall}</span>
                  <span className="stars">{renderStars(review.ratings.overall)}</span>
                </div>
              </div>

              <div className="review-ratings">
                <span>Work Culture: {review.ratings.workCulture}★</span>
                <span>Salary: {review.ratings.salary}★</span>
                <span>Career Growth: {review.ratings.careerGrowth}★</span>
              </div>

              <p className="review-text">{review.reviewText}</p>

              {review.pros && (
                <div className="pros-cons">
                  <strong>Pros:</strong> {review.pros}
                </div>
              )}

              {review.cons && (
                <div className="pros-cons">
                  <strong>Cons:</strong> {review.cons}
                </div>
              )}

              <p className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}