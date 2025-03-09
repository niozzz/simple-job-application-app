const express = require("express");
const router = express.Router();
const applyController = require("../controllers/applyController");

// Job routes
router.get("/", applyController.getAllApply);
// router.get("/:id", applyController.getJobById);
// router.post("/", applyController.createApply);
// router.put("/:id", applyController.updateJob);
// router.delete("/:id", applyController.deleteJob);

module.exports = router;
