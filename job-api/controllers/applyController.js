const { Apply } = require("../models");

exports.createApply = async (req, res) => {
  try {
    // Extract jobId from URL parameters
    const jobId = req.params.id;

    // Extract userId and applicationDate from request body
    const { userId, applicationDate } = req.body;

    // Validate parameters
    if (!jobId || !userId || !applicationDate) {
      return res.status(400).json({
        success: false,
        error: "Please provide jobId, userId, and applicationDate",
      });
    }

    // Create application
    const apply = await Apply.create({
      jobId,
      userId,
      applicationDate,
    });

    // Return success response
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
