const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const MAX_FAILED_ATTEMPTS = 5
const LOCK_MS = 15 * 60 * 1000
const TOKEN_TTL = "1d"
const INVALID = "Invalid email or password"

// Compared against when the account doesn't exist, so a missing email takes
// as long as a wrong password and response timing can't reveal accounts.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10)

/**
 * Shared login flow for users and admins.
 * Responds with the same 401 message for unknown email and wrong password.
 */
async function login(Model, role, req, res) {
    const { email, password } = req.body || {}
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password)
        return res.status(400).json({ message: "email and password are required" })

    const account = await Model.findOne({ email: email.trim().toLowerCase() })

    if (account?.lockUntil && account.lockUntil > Date.now()) {
        const minutes = Math.ceil((account.lockUntil - Date.now()) / 60000)
        return res.status(429).json({ message: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` })
    }

    const match = await bcrypt.compare(password, account?.password || DUMMY_HASH)

    if (!account || !account.password || !match) {
        if (account) {
            const attempts = (account.failedLoginAttempts || 0) + 1
            const update = attempts >= MAX_FAILED_ATTEMPTS
                ? { failedLoginAttempts: 0, lockUntil: new Date(Date.now() + LOCK_MS) }
                : { failedLoginAttempts: attempts }
            await Model.updateOne({ _id: account._id }, { $set: update })
        }
        return res.status(401).json({ message: INVALID })
    }

    if (account.failedLoginAttempts || account.lockUntil)
        await Model.updateOne({ _id: account._id }, { $set: { failedLoginAttempts: 0, lockUntil: null } })

    // Role comes from which collection the account lives in, never from the
    // stored document, so a user record can't be promoted into an admin token.
    const token = jwt.sign({ id: account._id, role }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL, algorithm: "HS256" })
    res.json({ token })
}

module.exports = { login }
