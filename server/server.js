const util = require("util");
if (util) {
  util._extend = function (target, source) {
    return Object.assign(target || {}, source);
  };
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./config/db");

const http = require("http");
const { Server } = require("socket.io");

const scanRoutes = require("./routes/scanRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const extensionRoutes = require("./routes/extensionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
app.set("trust proxy", 1);

// ✅ SECURITY HEADERS (Helmet with iframe support for AI Studio preview)
app.use(
  helmet({
    contentSecurityPolicy: false, // SPA renders dynamic assets and web workers
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    xFrameOptions: false, // Disable X-Frame-Options to allow embedding in preview iframe
  })
);

// ✅ UNIVERSAL CORS CONFIGURATION (Supports preview iframes, extensions, and custom domains)
const corsOptions = {
  origin: (origin, callback) => {
    // Reflect origin dynamically for browser requests, preview iframes, extensions, and server-to-server
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// ✅ CREATE HTTP SERVER WITH SECURE HEADER LIMITS (32KB)
const server = http.createServer(
  {
    maxHeaderSize: 32768, // 32KB secure header size limit
  },
  app
);

// Graceful handling for client socket errors
server.on("clientError", (err, socket) => {
  if (err.code === "HPE_HEADER_OVERFLOW" || err.message?.includes("Header")) {
    console.warn("[Server] clientError (header overflow):", err.message);
  } else {
    console.warn("[Server] clientError:", err.message);
  }
  if (!socket.destroyed) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

// Safeguard middleware: sanitize / reset oversized cookie headers on localhost
app.use((req, res, next) => {
  if (req.headers.cookie && req.headers.cookie.length > 16384) {
    console.warn("[Server] Truncated oversized Cookie header (>16KB) to prevent 431 error");
    delete req.headers.cookie;
  }
  next();
});

// ✅ SOCKET.IO INIT
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 5e6, // 5MB buffer limit
  allowEIO3: true,
});

// ✅ SAVE SOCKET INSTANCE
app.set("io", io);

// ✅ SOCKET CONNECTION
io.on("connection", (socket) => {
  socket.on("joinRoom", (userId) => {
    if (typeof userId === "string" && userId.length < 128) {
      socket.join(userId);
    }
  });
});

// ✅ CORS MIDDLEWARE
app.use(cors(corsOptions));

// ✅ BODY PARSER - with safe limits
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// ✅ API ROUTES
app.use("/api/scan", scanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/extension", extensionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contact", contactRoutes);

// ✅ HEALTH ROUTE (Supports both /health and /api/health for proxies & monitoring)
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "ThreatLens API Running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ STATIC UPLOADS
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ CLIENT STATIC BUILD & SPA FALLBACK
const clientBuildPath = path.join(__dirname, "..", "client", "build");
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send("🚀 ThreatLens API is running...");
    }
  });
});

// ✅ MONGOOSE / DATABASE CONNECTION WITH FALLBACK
mongoose.set("bufferCommands", false);
connectDB();

// ✅ ERROR MIDDLEWARE (Sanitized for production)
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (err.message &&
      (err.message.includes("buffering timed out") ||
        err.message.includes("ECONNREFUSED")))
  ) {
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res.status(503).json({ error: "Database service temporarily offline." });
  }

  // Handle CORS errors cleanly
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  console.error("Unhandled server exception:", err.message || err);
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: isDev ? err.message : "An unexpected server error occurred. Please try again.",
  });
});

// ✅ START SERVER
const PORT = 3000;

server.on("error", (err) => {
  console.error("Server error:", err.message);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ ThreatLens Server running on http://0.0.0.0:${PORT}`);
});
