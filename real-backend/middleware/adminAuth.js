const jwt = require("jsonwebtoken")
const AdminDetails = require("../models/admin")

module.exports = async (req, res, next) => {

    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"unauthorised"})
    }

    const token = authHeader.split(" ")[1]

    let payload
    try {
        // jwt.verify rejects expired tokens (exp claim) and pins the algorithm.
        payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] })
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" })
    }

    if (payload.role !== "admin")
        return res.status(403).json({ message: "Admins only" })

    try {
        // Confirm the account still exists in the admin collection, so a deleted
        // admin's token stops working and a token can't claim admin on its own.
        const admin = await AdminDetails.exists({ _id: payload.id })
        if (!admin) return res.status(403).json({ message: "Admins only" })
    } catch {
        return res.status(403).json({ message: "Admins only" })
    }

    req.admin = payload
    next()
}
