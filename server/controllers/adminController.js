const User = require("../models/User");
const Scan = require("../models/Scan");

// ─── USERS ────────────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    // FIX: Exclude password field from response
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.warn("getUsers DB error:", err.message);
    res.json([]);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // FIX: Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // FIX: Also delete all scans associated with this user
    await Scan.deleteMany({ userId: id });

    res.json({ message: "User and their scans deleted" });

  } catch (err) {
    console.error("deleteUser error:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ─── SCANS ────────────────────────────────────────────────────────────────────
const getAllScans = async (req, res) => {
  try {
    const scans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(500) // FIX: Prevent returning millions of records
      .populate("userId", "firstName lastName email"); // FIX: Populate user info
    res.json(scans);
  } catch (err) {
    console.warn("getAllScans DB error:", err.message);
    res.json([]);
  }
};

const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findByIdAndDelete(req.params.id);

    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }

    res.json({ message: "Scan deleted" });

  } catch (err) {
    console.error("deleteScan error:", err.message);
    res.status(500).json({ error: "Failed to delete scan" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `User role updated to ${role}`, user });
  } catch (err) {
    console.error("updateUserRole error:", err.message);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

const clearAllScans = async (req, res) => {
  try {
    await Scan.deleteMany({});
    res.json({ message: "All threat scans purged" });
  } catch (err) {
    console.error("clearAllScans error:", err.message);
    res.status(500).json({ error: "Failed to clear scans" });
  }
};

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: "admin" });
    const totalScans = await Scan.countDocuments();
    const highRiskScans = await Scan.countDocuments({ risk: { $in: ["High", "HIGH", "Critical", "CRITICAL"] } });
    const mediumRiskScans = await Scan.countDocuments({ risk: { $in: ["Medium", "MEDIUM"] } });
    const lowRiskScans = await Scan.countDocuments({ risk: { $in: ["Low", "LOW", "Safe", "SAFE"] } });

    res.json({
      totalUsers,
      adminUsers,
      totalScans,
      highRiskScans,
      mediumRiskScans,
      lowRiskScans,
      systemUptime: process.uptime(),
      nodeVersion: process.version,
      serverMemory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      dbStatus: "Healthy",
    });
  } catch (err) {
    console.error("getStats error:", err.message);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
};

module.exports = { getUsers, deleteUser, getAllScans, deleteScan, updateUserRole, clearAllScans, getStats };