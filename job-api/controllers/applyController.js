const { Apply } = require("../models");

// Create new job
exports.createApply = async (req, res) => {
  try {
    const { jobId, userId, applicationDate } = req.body;

    // Simple validation
    if (!jobId || !userId || !applicationDate) {
      return res.status(400).json({
        success: false,
        error: "Please provide jobId, userId, and applicationDate",
      });
    }

    // Create job
    const apply = await Apply.create({
      jobId,
      userId,
      applicationDate,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: apply.id,
        jobId: apply.jobId,
        userId: apply.userId,
        applicationDate: apply.applicationDate,
      },
    });
  } catch (error) {
    console.error("Error creating apply:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.getAllApply = async (req, res) => {
  try {
    const applies = await Apply.findAll();

    res.status(200).json({
      success: true,
      count: applies.length,
      data: applies,
    });
  } catch (error) {
    console.error("Error fetching application jobs:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
