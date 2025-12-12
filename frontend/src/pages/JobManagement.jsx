import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import "./JobManagement.css";

export default function JobManagement() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    skills: "",
    type: "Full-time",
  });

  // -------------------------
  // Load jobs when page loads
  // -------------------------
  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get("/jobs/my-jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching jobs (Unauthorized / No token)");
      navigate("/login");
    }
  };

  // -------------------------
  // Input Handler
  // -------------------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // -------------------------
  // Create or Update Job
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update job
        await api.put(`/jobs/${editingId}`, formData);
        alert("Job updated successfully!");
      } else {
        // Create new job
        await api.post("/jobs", formData);
        alert("Job posted successfully!");
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        company: "",
        location: "",
        skills: "",
        type: "Full-time",
      });

      setEditingId(null);
      fetchMyJobs();

    } catch (error) {
      console.error(error);
      alert("Error saving job");
    }
  };

  // -------------------------
  // Populate form for editing
  // -------------------------
  const handleEdit = (job) => {
    setEditingId(job._id);

    setFormData({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      skills: job.skills?.join(", ") || "",
      type: job.type,
    });
  };

  // -------------------------
  // Delete Job
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await api.delete(`/jobs/${id}`);
      fetchMyJobs();
    } catch (error) {
      console.error(error);
      alert("Error deleting job");
    }
  };

  // -------------------------
  // Toggle Job Status
  // -------------------------
  const toggleStatus = async (job) => {
    try {
      const newStatus = job.status === "Open" ? "Filled" : "Open";

      await api.put(`/jobs/${job._id}`, { status: newStatus });

      fetchMyJobs();
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Recruiter Dashboard</h2>

      {/* ---------------- FORM ---------------- */}
      <div className="job-form-card">
        <h3>{editingId ? "Edit Job" : "Post a New Job"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <input
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
            required
          />

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
          </select>

          <input
            name="skills"
            placeholder="Skills (e.g. React, Node)"
            value={formData.skills}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Job Description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editingId ? "Update Job" : "Post Job"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  description: "",
                  company: "",
                  location: "",
                  skills: "",
                  type: "Full-time",
                });
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* ---------------- JOB LIST ---------------- */}
      <div className="job-list">
        <h3>Your Posted Jobs</h3>

        {jobs.length === 0 && <p>No jobs posted yet.</p>}

        {jobs.map((job) => (
          <div
            key={job._id}
            className={`job-card ${job.status === "Filled" ? "filled" : ""}`}
          >
            <div>
              <h4>{job.title}</h4>
              <p>
                <strong>{job.company}</strong> — {job.location} ({job.type})
              </p>

              <p className="skills">
                Skills: {job.skills?.join(", ") || "None"}
              </p>

              <p>
                Status: <strong>{job.status}</strong>
              </p>
            </div>

            <div className="actions">
              <button
                onClick={() => toggleStatus(job)}
                className="status-btn"
              >
                Mark {job.status === "Open" ? "Filled" : "Open"}
              </button>

              <button
                onClick={() => handleEdit(job)}
                className="edit-btn"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(job._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
