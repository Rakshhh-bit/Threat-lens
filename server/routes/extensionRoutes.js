const express = require("express");
const router = express.Router();
const { scanLimiter } = require("../middleware/rateLimiter");

const {
  scanUrl,
  explain,
  scanText,
  scanDownload,
  scanFile,
} = require("../controllers/extensionController");

router.use(scanLimiter);

router.post("/scan-url", scanUrl);
router.post("/explain", explain);
router.post("/scan-text", scanText);
router.post("/scan-download", scanDownload);
router.post("/scan-file", scanFile);

module.exports = router;
