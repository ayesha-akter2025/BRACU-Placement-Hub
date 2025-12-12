import Job from "../models/Job.js";

// @desc    Create a new job
// @route   POST /api/jobs
export const createJob = async (req, res) => {
  try {
    const { title, description, company, location, skills, type } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      skills: skills.split(",").map(skill => skill.trim()), // Convert "React, Node" to ["React", "Node"]
      type,
      postedBy: req.user._id // Get ID from logged-in user
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// @desc    Get jobs posted by the specific recruiter
// @route   GET /api/jobs/my-jobs
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Update Job (Edit or Mark as Filled)
// @route   PUT /api/jobs/:id
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Make sure the logged-in user owns this job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized to edit this job" });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Delete Job
// @route   DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.json({ msg: "Job removed" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};