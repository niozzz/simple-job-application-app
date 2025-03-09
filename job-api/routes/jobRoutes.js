const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const applyController = require("../controllers/applyController");

// Job routes
router.get("/", jobController.getAllJobs);
// router.get("/:id", jobController.getJobById);
router.post("/", jobController.createJob);
router.post("/:id/apply", applyController.createApply);
// router.put("/:id", jobController.updateJob);
// router.delete("/:id", jobController.deleteJob);

module.exports = router;
