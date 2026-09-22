const express = require("express");

const {
    createTicket,
    getTickets,
    getTicketById
} = require("../controllers/ticketController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new ticket
router.post("/", protect, createTicket);

// Get all tickets
router.get("/", protect, getTickets);

// Get a ticket by its public ticket ID
router.get("/track/:ticketId", protect, getTicketById);

module.exports = router;