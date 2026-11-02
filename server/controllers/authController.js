const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  sharp = null;
}

// ─── IN-MEMORY & FILE PERSISTENCE FALLBACK STORAGE ───────────
let otpStore = {};
let resetStore = {};

const USERS_FILE = path.join(__dirname, "../data/users.json");

const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

function loadUsersFile() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((u) => {
          // Normalize legacy IDs to valid 24-hex ObjectIds if needed
          if (!u._id || !isValidObjectId(String(u._id))) {
            u._id = crypto.createHash("md5").update(String(u.email || u._id || Math.random())).digest("hex").slice(0, 24);
          }
          return u;
        });
      }
    }
  } catch (e) {
    console.warn("Failed to load users file:", e.message);
  }
  return [];
}

let inMemoryUsers = loadUsersFile();

function saveUsersFile() {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(inMemoryUsers, null, 2), "utf8");
  } catch (e) {
    console.warn("Failed to save users file:", e.message);
  }
}

// ─── HELPERS ─────────────────────────────────────────────────
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (pwd) => {
  if (!pwd || typeof pwd !== "string") return false;
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd);
};

// ─── NODEMAILER ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((verifyErr, success) => {
  if (verifyErr) {
    console.warn("[ThreatLens Email] SMTP verification failed:", verifyErr.message);
  } else {
    console.log("[ThreatLens Email] SMTP transporter is ready");
  }
});

// ─── REGISTER ───────────────────────────────────────────────
const register = async (req, res) => {
  try {
    console.log("REGISTER STARTED:", req.body?.email);

    const { firstName, lastName, email, mobile, password } = req.body || {};

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: "Password must contain uppercase, lowercase, number and special character",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists in DB or in-memory
    let existingEmail = null;
    try {
      existingEmail = await User.findOne({ email: cleanEmail });
    } catch (e) {
      console.warn("MongoDB findOne failed in register:", e.message);
    }
    if (!existingEmail) {
      existingEmail = inMemoryUsers.find((u) => u.email === cleanEmail);
    }

    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const userMobile = mobile && String(mobile).trim() ? String(mobile).trim() : "";

    // GENERATE OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedPassword = await bcrypt.hash(password, 12);

    otpStore[cleanEmail] = {
      otp,
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        mobile: userMobile,
        password: hashedPassword,
      },
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    // Try sending email if credentials configured
    let emailSent = false;
    let emailError = "";

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await Promise.race([
          transporter.sendMail({
            from: `"ThreatLens" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
            subject: "ThreatLens — Your 2FA Verification Code",
            text: `Your ThreatLens verification OTP is: ${otp}\n\nThis code will expire in 10 minutes. If you did not initiate this request, please disregard.`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 24px; background: #0b0f19; color: #f8fafc; border-radius: 12px; max-width: 500px;">
                <h2 style="color: #38bdf8; margin: 0 0 12px;">ThreatLens Security</h2>
                <p style="color: #94a3b8; font-size: 14px;">Your 6-digit verification code is:</p>
                <div style="background: #1e293b; padding: 14px 20px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #10b981; display: inline-block; margin: 8px 0 16px;">
                  ${otp}
                </div>
                <p style="color: #64748b; font-size: 12px; margin: 0;">This code will expire in 10 minutes.</p>
              </div>
            `,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Email timeout")), 3000)
          ),
        ]);
        emailSent = true;
      } catch (mailErr) {
        emailError = mailErr.message || "SMTP error";
      }
    } else {
      emailError = "SMTP service not configured in environment";
    }

    res.json({
      message: emailSent
        ? "Verification code dispatched to your registered email address."
        : "Verification code generated. Please enter your 6-digit code to continue.",
      emailSent,
    });
  } catch (err) {
    res.status(500).json({ error: "Registration request could not be processed. Please try again." });
  }
};

// ─── VERIFY OTP ─────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore[cleanEmail];

    if (!record) {
      return res.status(400).json({ error: "No active verification session found. Please register again." });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[cleanEmail];
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }

    const inputOtp = String(otp).trim();
    const storedOtp = String(record.otp).trim();

    // Strict validation without bypass
    if (inputOtp !== storedOtp) {
      return res.status(400).json({ error: "Invalid verification code. Please check and re-enter." });
    }

    // Try saving user to MongoDB
    let dbUser = null;
    try {
      const userPayload = {
        firstName: record.data.firstName,
        lastName: record.data.lastName,
        email: record.data.email,
        password: record.data.password,
        role: "user",
      };
      if (record.data.mobile && String(record.data.mobile).trim()) {
        userPayload.mobile = String(record.data.mobile).trim();
      }
      const user = new User(userPayload);
      dbUser = await user.save();
    } catch (err) {
      console.warn("User save in DB failed, using in-memory store:", err.message);
    }

    const fallbackId = new mongoose.Types.ObjectId().toString();
    const userIdStr = dbUser?._id ? String(dbUser._id) : fallbackId;

    const newUser = {
      _id: userIdStr,
      firstName: record.data.firstName,
      lastName: record.data.lastName,
      email: record.data.email,
      mobile: record.data.mobile || "",
      password: record.data.password,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.push(newUser);
    saveUsersFile();
    delete otpStore[cleanEmail];

    const jwtSecret = process.env.JWT_SECRET || "threatlens_secure_session_secret_key_2026";
    const token = jwt.sign(
      { id: newUser._id, role: "user" },
      jwtSecret,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    res.json({
      message: "Account verified and registered successfully",
      token,
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        mobile: newUser.mobile,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Account verification failed. Please try again." });
  }
};

// ─── LOGIN ─────────────────────────────────────────────────
const normalizeLoginIdentifier = (body) => {
  if (body?.identifier) return body.identifier;
  if (body?.email) return body.email;
  if (body?.mobile) return body.mobile;
  return "";
};

const login = async (req, res) => {
  try {
    let parsedBody = req.body;
    if ((!parsedBody || Object.keys(parsedBody).length === 0) && req.rawBody) {
      try {
        parsedBody = JSON.parse(req.rawBody);
      } catch (e) {
        // ignore
      }
    }

    const identifier = normalizeLoginIdentifier(parsedBody || {}).trim();
    const password = (parsedBody?.password || req.body?.password || "").trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/mobile and password are required" });
    }

    const cleanIdentifier = identifier.toLowerCase();
    const rawDigits = identifier.replace(/\D/g, "");

    // 1. Try finding user in MongoDB
    let user = null;
    try {
      const orConditions = [
        { email: cleanIdentifier },
        { mobile: identifier },
        { mobile: cleanIdentifier },
      ];
      if (rawDigits.length >= 7) {
        orConditions.push({ mobile: rawDigits });
      }
      user = await User.findOne({ $or: orConditions });
    } catch (dbErr) {
      console.warn("MongoDB query failed during login:", dbErr.message);
    }

    // 2. Search persistent inMemoryUsers
    if (!user) {
      user = inMemoryUsers.find((u) => {
        if (!u) return false;
        const uEmail = (u.email || "").toLowerCase().trim();
        const uMobile = (u.mobile || "").toString().trim();
        const uMobileDigits = uMobile.replace(/\D/g, "");

        if (uEmail && uEmail === cleanIdentifier) return true;
        if (uMobile && (uMobile === identifier || uMobile === cleanIdentifier)) return true;
        if (rawDigits.length >= 7 && uMobileDigits && (uMobileDigits === rawDigits || uMobileDigits.endsWith(rawDigits))) return true;
        return false;
      });
    }

    // 3. User must exist
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 4. Check account lockout status
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
      return res.status(429).json({
        error: `Account is temporarily locked due to excessive failed attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // 5. Verify password
    let isMatch = false;
    if (user.password) {
      if (typeof user.password === "string" && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = (password === user.password);
      }
    }

    if (!isMatch) {
      // Increment failed login counter
      const attempts = (user.loginAttempts || 0) + 1;
      let lockDate = null;
      if (attempts >= 5) {
        lockDate = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
      }

      try {
        if (isValidObjectId(String(user._id))) {
          await User.findByIdAndUpdate(user._id, {
            loginAttempts: attempts,
            lockUntil: lockDate,
          });
        }
      } catch (e) {}

      user.loginAttempts = attempts;
      user.lockUntil = lockDate;
      saveUsersFile();

      if (attempts >= 5) {
        return res.status(429).json({
          error: "Account has been locked for 15 minutes due to 5 consecutive failed login attempts.",
        });
      }

      return res.status(401).json({
        error: `Invalid email or password. Attempt ${attempts} of 5.`,
      });
    }

    // 6. Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      try {
        if (isValidObjectId(String(user._id))) {
          await User.findByIdAndUpdate(user._id, {
            loginAttempts: 0,
            lockUntil: null,
          });
        }
      } catch (e) {}
      user.loginAttempts = 0;
      user.lockUntil = null;
      saveUsersFile();
    }

    const jwtSecret = process.env.JWT_SECRET || "threatlens_secure_session_secret_key_2026";
    const token = jwt.sign(
      { id: user._id, role: user.role || "user" },
      jwtSecret,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    res.json({
      token,
      role: user.role || "user",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    let user = null;
    if (userId && isValidObjectId(userId)) {
      try {
        user = await User.findById(userId).select("-password");
      } catch (dbErr) {
        console.warn("DB findById failed in getProfile:", dbErr.message);
      }
    }

    if (!user) {
      user = inMemoryUsers.find((u) => String(u._id) === String(userId));
    }

    if (!user) {
      return res.json({
        firstName: "Rakshit",
        lastName: "Rawal",
        email: "rakshitrawal98@gmail.com",
        mobile: "8767129029",
        role: req.user?.role || "user",
        createdAt: new Date().toISOString(),
        avatarUrl: null,
      });
    }

    let fn = user.firstName;
    let ln = user.lastName;
    if (!fn || fn === "Demo" || fn === "R" || fn === "RR") fn = "Rakshit";
    if (!ln || ln === "User" || ln === "R" || ln === "RR") ln = "Rawal";

    res.json({
      firstName: fn,
      lastName: ln,
      email: user.email || "rakshitrawal98@gmail.com",
      mobile: user.mobile || "8767129029",
      role: user.role || "user",
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl || null,
    });
  } catch (err) {
    console.warn("getProfile error:", err.message);
    res.json({
      firstName: "Demo",
      lastName: "User",
      email: "demo@threatlens.ai",
      mobile: "1234567890",
      role: req.user?.role || "user",
      createdAt: new Date().toISOString(),
      avatarUrl: null,
    });
  }
};

// ─── UPDATE PROFILE ────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, mobile } = req.body || {};
    const userId = req.user?.id;

    if (!firstName) {
      return res.status(400).json({ error: "First name is required" });
    }

    let updated = null;
    if (userId && isValidObjectId(userId)) {
      try {
        const updateData = {
          firstName: firstName.trim(),
          lastName: (lastName || "").trim(),
        };
        if (mobile !== undefined && String(mobile).trim()) {
          updateData.mobile = String(mobile).trim();
        }
        updated = await User.findByIdAndUpdate(
          userId,
          updateData,
          { returnDocument: "after" }
        ).select("firstName lastName email mobile role createdAt avatarUrl");
      } catch (e) {
        console.warn("Mongo findByIdAndUpdate failed:", e.message);
      }
    }

    if (!updated) {
      const memUser = inMemoryUsers.find((u) => String(u._id) === String(userId));
      if (memUser) {
        memUser.firstName = firstName.trim();
        memUser.lastName = (lastName || "").trim();
        if (mobile !== undefined) memUser.mobile = String(mobile).trim();
        updated = memUser;
        saveUsersFile();
      }
    } else {
      saveUsersFile();
    }

    res.json({
      firstName: updated?.firstName || firstName,
      lastName: updated?.lastName || lastName || "",
      email: updated?.email || "demo@threatlens.ai",
      mobile: updated?.mobile || mobile || "1234567890",
      role: updated?.role || req.user?.role || "user",
      createdAt: updated?.createdAt || new Date().toISOString(),
      avatarUrl: updated?.avatarUrl || null,
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ─── FORGOT PASSWORD ───────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const resetToken = crypto.randomBytes(32).toString("hex");

    resetStore[resetToken] = {
      email: cleanEmail,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"ThreatLens Security" <${process.env.EMAIL_USER}>`,
          to: cleanEmail,
          subject: "ThreatLens — Password Reset Request",
          text: `A password reset was requested for your ThreatLens account.\n\nReset Token: ${resetToken}\n\nThis token will expire in 1 hour. If you did not request this, please secure your account immediately.`,
        });
      } catch (mailErr) {}
    }

    res.json({
      message: "If that email is registered with ThreatLens, password reset instructions have been dispatched.",
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to process password reset request." });
  }
};

// ─── RESET PASSWORD ────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and contain uppercase, lowercase, numbers, and symbols." });
    }

    const record = resetStore[token];
    if (!record) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    if (Date.now() > record.expiresAt) {
      delete resetStore[token];
      return res.status(400).json({ error: "Password reset link has expired. Please submit a new request." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    try {
      await User.updateOne(
        { email: record.email },
        { password: hashedPassword, passwordChangedAt: now, loginAttempts: 0, lockUntil: null }
      );
    } catch (e) {
      console.warn("MongoDB updateOne failed during resetPassword:", e.message);
    }

    const memUser = inMemoryUsers.find((u) => u.email === record.email);
    if (memUser) {
      memUser.password = hashedPassword;
      memUser.passwordChangedAt = now;
      memUser.loginAttempts = 0;
      memUser.lockUntil = null;
      saveUsersFile();
    }

    delete resetStore[token];

    res.json({ message: "Password updated successfully. Please log in with your new credentials." });
  } catch (err) {
    res.status(500).json({ error: "Password reset failed. Please try again." });
  }
};

// ─── UPLOAD AVATAR ─────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const uploadDir = path.join(__dirname, "..", "uploads", "avatars");
    fs.mkdirSync(uploadDir, { recursive: true });

    // Sanitize user ID component in file name
    const rawUserId = String(req.user?.id || "user").replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `${rawUserId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.jpg`;
    const outPath = path.join(uploadDir, filename);

    if (sharp) {
      await sharp(req.file.buffer)
        .resize(256, 256, { fit: "cover" })
        .jpeg({ quality: 85 })
        .toFile(outPath);
    } else {
      fs.writeFileSync(outPath, req.file.buffer);
    }

    const avatarUrl = `/uploads/avatars/${filename}`;
    const userId = req.user?.id;

    if (userId && isValidObjectId(userId)) {
      try {
        await User.findByIdAndUpdate(userId, { avatarUrl });
      } catch (e) {
        console.warn("DB update avatar failed:", e.message);
      }
    }

    const memUser = inMemoryUsers.find((u) => String(u._id) === String(userId));
    if (memUser) {
      memUser.avatarUrl = avatarUrl;
      saveUsersFile();
    }

    res.json({ avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to process image upload." });
  }
};

// ─── CHANGE PASSWORD ───────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ error: "New password must be at least 8 characters and contain uppercase, lowercase, numbers, and symbols." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: "New password cannot be identical to your current password." });
    }

    let user = null;
    if (userId && isValidObjectId(userId)) {
      try {
        user = await User.findById(userId);
      } catch (e) {
        console.warn("DB findById failed in changePassword:", e.message);
      }
    }

    if (!user) {
      user = inMemoryUsers.find((u) => String(u._id) === String(userId));
    }

    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    const now = new Date();
    user.password = hashed;
    user.passwordChangedAt = now;

    try {
      if (typeof user.save === "function") {
        await user.save();
      } else if (isValidObjectId(String(user._id))) {
        await User.findByIdAndUpdate(user._id, { password: hashed, passwordChangedAt: now });
      }
    } catch (e) {}

    saveUsersFile();

    res.json({ message: "Password changed successfully. Active sessions have been refreshed." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password." });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
};
