const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const { scanLimiter } = require("../middleware/rateLimiter");

const {
  scanEmail,
  scanLink,
  scanMessage,
  getScans,
} = require("../controllers/scanController");

router.post("/email", optionalAuthMiddleware, scanLimiter, scanEmail);
router.post("/link", optionalAuthMiddleware, scanLimiter, scanLink);
router.post("/message", optionalAuthMiddleware, scanLimiter, scanMessage);
router.get("/", authMiddleware, getScans);

module.exports = router;
