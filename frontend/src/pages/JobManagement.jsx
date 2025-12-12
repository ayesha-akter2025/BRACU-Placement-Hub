import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import "./JobManagement.css";

export default function JobManagement() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // --- UPDATED STATE with new fields ---
  const [formData, setFormData] = useState({
    title: "", description: "", company: "", location: "", skills: "", 
    type: "Full-time", 
    salaryRange: "", // New
    deadline: ""     // New
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get("/jobs/my-jobs");
      setJobs(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/jobs/${editingId}`, formData);
        alert("Job updated successfully!");
      } else {
        await api.post("/jobs", formData);
        alert("Job posted successfully!");
      }
      // Reset form
      setFormData({ 
        title: "", description: "", company: "", location: "", skills: "", 
        type: "Full-time", salaryRange: "", deadline: "" 
      });
      setEditingId(null);
      fetchMyJobs();
    } catch (error) {
      alert("Error saving job");
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    
    // Format Date for HTML Input (YYYY-MM-DD)
    const formattedDate = job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : "";

    setFormData({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      skills: job.skills?.join(", ") || "",
      type: job.type,
      salaryRange: job.salaryRange || "",
      deadline: formattedDate
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      fetchMyJobs();
    } catch (error) {
      alert("Error deleting job");
    }
  };

  const toggleStatus = async (job) => {
    try {
      const newStatus = job.status === "Open" ? "Filled" : "Open";
      await api.put(`/jobs/${job._id}`, { status: newStatus });
      fetchMyJobs();
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Helper to display friendly date
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  return (
    <div className="dashboard-container">
      
      {/* --- PROFESSIONAL TOP NAVBAR --- */}
      <nav className="dashboard-navbar">
        <h2 className="dashboard-title">Recruiter Hub</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        
        {/* --- LEFT: STICKY FORM --- */}
        <div className="job-form-card">
          <h3>{editingId ? "✏️ Edit Job Posting" : "🚀 Post a New Opportunity"}</h3>

          <form onSubmit={handleSubmit}>
            <div>
              <span className="form-label">Title</span>
              <input
                name="title"
                placeholder="Job Title (e.g. Software Engineer)"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <span className="form-label">Company</span>
              <input
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <div style={{flex: 1}}>
                <span className="form-label">Location</span>
                <input
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{width: '120px'}}>
                <span className="form-label">Type</span>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>

            {/* --- NEW FIELDS: Salary & Deadline --- */}
            <div style={{display: 'flex', gap: '10px'}}>
              <div style={{flex: 1}}>
                <span className="form-label">Salary Range</span>
                <input
                  name="salaryRange"
                  placeholder="e.g. 50k-80k"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{flex: 1}}>
                <span className="form-label">Deadline</span>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <span className="form-label">Skills</span>
              <input
                name="skills"
                placeholder="Skills (comma separated tags)"
                value={formData.skills}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <span className="form-label">Description</span>
              <textarea
                name="description"
                placeholder="Write a compelling job description..."
                rows="6"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              {editingId ? "Save Changes" : "Post Job Now"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-edit-btn"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ title: "", description: "", company: "", location: "", skills: "", type: "Full-time", salaryRange: "", deadline: "" });
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* --- RIGHT: JOB LIST --- */}
        <div className="job-list-section">
          <h3>Your Active Listings <span className="badge-count">{jobs.length}</span></h3>

          <div className="job-list">
            {jobs.length === 0 && (
              <div className="empty-state">
                <p>You haven't posted any jobs yet.</p>
                <small>Use the form to create your first listing.</small>
              </div>
            )}

            {jobs.map((job) => (
              <div key={job._id} className={`job-card ${job.status === "Filled" ? "filled" : ""}`}>
                
                <div className="job-main-info">
                  <div className="job-title-row">
                    <h4>{job.title}</h4>
                    <span className={`status-badge ${job.status === 'Open' ? 'open' : 'filled'}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="company-info">
                    <span>🏢 {job.company}</span>
                    <span className="dot-separator">•</span>
                    <span>📍 {job.location}</span>
                    <span className="dot-separator">•</span>
                    <span>🕒 {job.type}</span>
                  </div>

                  {/* --- NEW INFO DISPLAY --- */}
                  <div className="company-info" style={{fontWeight: '500', color: '#2d3748', marginTop: '5px'}}>
                    <span>💰 {job.salaryRange}</span>
                    <span className="dot-separator">•</span>
                    {/* Turn red if deadline passed */}
                    <span style={{ color: new Date(job.deadline) < new Date() ? '#e53e3e' : 'inherit' }}>
                      📅 Due: {formatDateDisplay(job.deadline)}
                    </span>
                  </div>

                  <div className="skills-container">
                    {job.skills?.map((skill, index) => (
                      <span key={index} className="skill-pill">{skill.trim()}</span>
                    ))}
                  </div>
                </div>

                <div className="card-actions">
                  <button onClick={() => toggleStatus(job)} className="btn-toggle">
                    {job.status === "Open" ? "Close Job" : "Re-open"}
                  </button>
                  <button onClick={() => handleEdit(job)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(job._id)} className="btn-delete">
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}