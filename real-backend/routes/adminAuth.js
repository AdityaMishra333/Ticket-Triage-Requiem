const router = require("express").Router()
const AdminDetails = require("../models/admin")
const { authLimiter } = require("../middleware/rateLimit")
const { login } = require("../services/login")

// No admin signup route on purpose: admin accounts are created directly in the database.
router.post('/login', authLimiter, async (req, res) => {
    try {
        await login(AdminDetails, "admin", req, res)
    } catch (err) {
        console.error("Admin login failed:", err)
        res.status(500).json({ message: "something went wrong" })
    }
})

module.exports = router
