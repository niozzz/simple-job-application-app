const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const jobRoutes = require("./jobRoutes");
const applyRoutes = require("./applyRoutes");

// API routes
router.use("/api/users", userRoutes);
router.use("/api/jobs", jobRoutes);
router.use("/api/applies", applyRoutes);

// Default route
router.get("/", (req, res) => {
  res.json({ message: "Welcome to our API" });
});

module.exports = router;
