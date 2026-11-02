const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 requests per 15 mins
  message: { error: "Too many authentication attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 contact submissions per 15 mins
  message: { error: "Too many contact submissions from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120, // 120 scans per 15 mins
  message: { error: "Scan rate limit exceeded. Please wait a moment before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  limiter: apiLimiter,
  apiLimiter,
  authLimiter,
  contactLimiter,
  scanLimiter,
};