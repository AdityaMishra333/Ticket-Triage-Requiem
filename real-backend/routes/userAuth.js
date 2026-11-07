const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const UserDetails = require("../models/user")

const isFilled = (value) => typeof value === "string" && value.trim() !== ""

router.post('/create', async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!isFilled(name) || !isFilled(email) || !isFilled(password))
            return res.status(400).json({ message: "name, email and password are required" })

        const normalizedEmail = email.trim().toLowerCase()
        const existing = await UserDetails.findOne({ email: normalizedEmail })
        if (existing)
            return res.status(409).json({ message: "email already registered" })

        const hash = await bcrypt.hash(password, 10)
        await UserDetails.create({ name: name.trim(), email: normalizedEmail, password: hash })

        res.status(201).send("user registered")
    }
    catch (err) {
        console.error("Register failed:", err)
        res.status(500).json({ message: "something went wrong" })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!isFilled(email) || !isFilled(password))
            return res.status(400).send("email and password are required")

        const user = await UserDetails.findOne({ email: email.trim().toLowerCase() })
        if (!user) return res.status(404).send("user not found")

        const match = user.password && await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).send("incorrect password")

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.json({token})
    } catch (err) {
        console.error("Login failed:", err)
        res.status(500).json({ message: "something went wrong" })
    }
})

module.exports = router
