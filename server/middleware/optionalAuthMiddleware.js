const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Optional: Proceed as guest
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "threatlens_secure_session_secret_key_2026";

    try {
      const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
      if (decoded && decoded.id) {
        req.user = {
          id: decoded.id,
          role: decoded.role || "user",
        };
      }
    } catch (tokenErr) {
      // If token invalid, still allow scan to complete as guest
      req.user = null;
    }

    next();
  } catch (err) {
    req.user = null;
    next();
  }
};
