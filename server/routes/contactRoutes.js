const express = require("express");
const router = express.Router();
const { submitContactQuery, getContactQueries } = require("../controllers/contactController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const { contactLimiter } = require("../middleware/rateLimiter");

// Public submit contact query with rate limiting
router.post("/", contactLimiter, submitContactQuery);
router.post("/submit", contactLimiter, submitContactQuery);

// List queries (Admin only)
router.get("/", authMiddleware, adminOnly, getContactQueries);

module.exports = router;
