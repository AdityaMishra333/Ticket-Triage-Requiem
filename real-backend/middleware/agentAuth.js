const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    const token = req.cookies.token

    if (!token) 
        return res.status(401).json({ message: "Unauthorised" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== "agent") 
        return res.status(403).json({ message: "Only team members allowed" })

    req.user = decoded
    next()
}
