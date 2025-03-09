const { Job } = require("../models");

// Create new job
exports.createJob = async (req, res) => {
  try {
    const { title, description, companyName, salaryRange, location } = req.body;

    // Simple validation
    if (!title || !companyName) {
      return res.status(400).json({
        success: false,
        error: "Please provide job title and company name",
      });
    }

    // Create job
    const job = await Job.create({
      title,
      description,
      companyName,
      salaryRange,
      location,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        description: job.description,
        salaryRange: job.salaryRange,
        location: job.location,
      },
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
