const rateLimit = require("express-rate-limit");

// Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

// General API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};