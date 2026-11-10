require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const userAuthRoutes = require("./routes/userAuth")
const adminAuthRoutes = require("./routes/adminAuth")

const app = express()
const PORT = process.env.PORT || 5000

// Behind Vercel's proxy, trust one hop so rate limiting sees the real client IP.
// Locally there is no proxy, so X-Forwarded-For is not trusted (can't be spoofed).
if (process.env.VERCEL) app.set("trust proxy", 1)

const allowedOrigins = [
    "http://localhost:5173",
    "http://10.71.3.224:5173",
    ...(process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim().replace(/\/$/, "")).filter(Boolean)
]

let connection
const connectDb = () => {
    connection ??= mongoose.connect(process.env.MONGO_URI).catch((err) => {
        connection = undefined
        throw err
    })
    return connection
}

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(async (req, res, next) => {
    try {
        await connectDb()
        next()
    } catch (err) {
        console.error("Database connection failed:", err.message)
        res.status(503).json({ message: "Service temporarily unavailable" })
    }
})
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", userAuthRoutes)
app.use("/api/admin", adminAuthRoutes)
app.use("/api/tickets", require("./routes/tickets"))

if (require.main === module) {
    connectDb().then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    })
}

module.exports = app
