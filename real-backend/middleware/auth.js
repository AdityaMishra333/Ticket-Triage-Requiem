const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"unauthorised"})
    }

    const token = authHeader.split(" ")[1]

    try {
        // Rejects expired tokens (exp claim) and pins the signing algorithm.
        req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] })
        next()
    } catch {
        res.status(401).json({ message: "Invalid or expired token" })
    }
}