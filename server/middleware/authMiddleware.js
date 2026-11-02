const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "threatlens_secure_session_secret_key_2026";

    // ✅ VERIFY TOKEN WITH EXPLICIT ALGORITHM PINNING
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // Optional check for password change invalidation
    if (decoded.iat) {
      try {
        const user = await User.findById(decoded.id).select("passwordChangedAt").lean();
        if (user && user.passwordChangedAt) {
          const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
          if (decoded.iat < changedTimestamp) {
            return res.status(401).json({ error: "Password was recently changed. Please log in again." });
          }
        }
      } catch (dbErr) {
        // Fallback gracefully if database lookup fails
      }
    }

    // ✅ ATTACH USER TO REQUEST
    req.user = {
      id: decoded.id,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};