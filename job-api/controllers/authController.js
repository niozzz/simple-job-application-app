// auth.controller.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const bcrypt = require("bcrypt");

const secretKey = process.env.JWT_SECRET; // ambil dari env

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username and password",
      });
    }

    const user = await User.findOne({ where: { name: username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    const payload = {
      userId: user.id,
      username: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    res.json({
      success: true,
      token,
      role: user.role,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
