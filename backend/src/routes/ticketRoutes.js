const express = require("express");

const {
    createTicket,
    getTickets,
    getTicketById,
    trackTicket
} = require("../controllers/ticketController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTicket);

router.get("/", protect, getTickets);

// Public tracking
router.get("/track/:ticketId", trackTicket);

// Authenticated ticket details
router.get("/:ticketId", protect, getTicketById);

module.exports = router;
