const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"unauthorised"})
    }

    const token = authHeader.split(" ")[1]

    try {
        req.admin = jwt.verify(token, process.env.JWT_SECRET)

        if (req.admin.role !== "admin") 
            return res.status(403).json({ message: "Admins only" })
        
        next()
    } catch {
        res.status(401).json({ message: "Invalid or expired token" })
    }
}
