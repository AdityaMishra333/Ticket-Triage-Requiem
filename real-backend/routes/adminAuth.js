const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const AdminDetails = require("../models/admin")

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password)
            return res.status(400).send("email and password are required")

        const admin = await AdminDetails.findOne({ email: email.trim().toLowerCase() })
        if (!admin) return res.status(404).send("admin not found")

        const match = admin.password && await bcrypt.compare(password, admin.password)
        if (!match) return res.status(401).send("incorrect password")

        const token = jwt.sign({id: admin._id, role: admin.role}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.json({token})
    } catch (err) {
        console.error("Admin login failed:", err)
        res.status(500).json({ message: "something went wrong" })
    }
})

module.exports = router
