const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const jobRoutes = require("./jobRoutes");
const applyRoutes = require("./applyRoutes");
const authController = require("../controllers/authController");
// const authController = require

// API routes
router.use("/api/users", userRoutes);
router.use("/api/jobs", jobRoutes);
router.use("/api/applies", applyRoutes);

// API Authentication
router.post("/api/login", authController.login);
router.post("/api/register", authController.register);

// Default route
router.get("/", (req, res) => {
  res.json({ message: "Welcome to our API" });
});

module.exports = router;
