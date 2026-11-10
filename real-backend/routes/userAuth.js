const router = require("express").Router()
const bcrypt = require("bcrypt")
const UserDetails = require("../models/user")
const { authLimiter } = require("../middleware/rateLimit")
const { login } = require("../services/login")

const isFilled = (value) => typeof value === "string" && value.trim() !== ""

// At least 8 characters with a lowercase letter, an uppercase letter and a number.
// bcrypt ignores everything past 72 bytes, so longer passwords are rejected.
const passwordError = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters."
    if (Buffer.byteLength(password, "utf8") > 72) return "Password must be at most 72 characters."
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
        return "Password must include an uppercase letter, a lowercase letter and a number."
    return ""
}

router.post('/create', authLimiter, async (req, res) => {
    try {
        // Only these fields are read from the body; role is always "user".
        const { name, email, password } = req.body || {}
        if (!isFilled(name) || !isFilled(email) || !isFilled(password))
            return res.status(400).json({ message: "name, email and password are required" })

        const weak = passwordError(password)
        if (weak) return res.status(400).json({ message: weak })

        const normalizedEmail = email.trim().toLowerCase()
        const existing = await UserDetails.findOne({ email: normalizedEmail })
        if (existing)
            return res.status(409).json({ message: "email already registered" })

        const hash = await bcrypt.hash(password, 10)
        await UserDetails.create({ name: name.trim(), email: normalizedEmail, password: hash, role: "user" })

        res.status(201).send("user registered")
    }
    catch (err) {
        console.error("Register failed:", err)
        res.status(500).json({ message: "something went wrong" })
    }
})

router.post('/login', authLimiter, async (req, res) => {
    try {
        await login(UserDetails, "user", req, res)
    } catch (err) {
        console.error("Login failed:", err)
        res.status(500).json({ message: "something went wrong" })
    }
})

module.exports = router
