const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const UserDetails = require("../models/user")

router.post('/create', async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existing = await UserDetails.findOne({ email })
        if (existing) 
            return res.status(409).json({ message: "email already registered" })

        const hash = await bcrypt.hash(password, 10)
        await UserDetails.create({ name, email, password: hash })

        res.send("user registered")
    } 
    catch (err) {
        res.status(500).json({ message: "something went wrong" })
    }
})

router.post('/login',async (req,res) => {
    let {email, password} = req.body
    const user = await UserDetails.findOne({email})
    // bcrypt.compare(password,user.password)

    if(!user) return res.status(404).send("user not found")
    const match = await bcrypt.compare(password,user.password)
    if(!match) return res.status(401).send("incorrect password")

    const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'})
    res.json({token})
})

module.exports = router