const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected profile
router.get("/profile", protect, (req, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.user
    });
});

module.exports = router;