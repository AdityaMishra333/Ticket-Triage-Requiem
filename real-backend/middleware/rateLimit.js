const { rateLimit } = require("express-rate-limit")

// 5 attempts per minute per IP on auth endpoints.
// Note: the default store is in-memory, so on serverless hosts (Vercel) each
// instance keeps its own counter. Per-account lockout (services/login.js) is
// stored in MongoDB and covers that gap.
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts. Please wait a minute and try again." }
})

module.exports = { authLimiter }
