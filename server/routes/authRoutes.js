const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authLimiter } = require("../middleware/rateLimiter");

const {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Configure secure multer memory storage with strict MIME filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
    }
  },
});

router.post("/register", authLimiter, register);
router.post("/verify", authLimiter, verifyOTP);
router.post("/login", authLimiter, login);
router.post("/forgot", authLimiter, forgotPassword);
router.post("/reset", authLimiter, resetPassword);

// Profile endpoints
router.get("/me", authMiddleware, getProfile);
router.patch("/me", authMiddleware, updateProfile);

// Avatar upload
router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

// Change password
router.post("/change-password", authMiddleware, authLimiter, changePassword);

module.exports = router;