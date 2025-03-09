// auth.middleware.js
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid token",
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
