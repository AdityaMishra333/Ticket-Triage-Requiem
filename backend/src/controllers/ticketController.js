const Ticket = require("../models/Ticket");

// Check whether the logged-in user can access the ticket
const canAccessTicket = (ticket, user) =>
    user.role === "agent" ||
    ticket.customerId.toString() === user.id;

// Create a new ticket
const createTicket = async (req, res) => {
    try {
        const {
            subject,
            description,
            contactDetails
        } = req.body;

        // Validate required fields
        if (!subject || !description || !contactDetails) {
            return res.status(400).json({
                message:
                    "Subject, description and contact details are required."
            });
        }

        // Generate unique ticket ID
        const ticketId = `TKT-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;

        // Create ticket
        const ticket = await Ticket.create({
            ticketId,
            customerId: req.user.id,
            subject,
            description,
            contactDetails,
            status: "submitted",

            // First entry in status timeline
            statusHistory: [
                {
                    status: "submitted",
                    actor: "customer"
                }
            ]
        });

        // Send response
        res.status(201).json({
            message: "Ticket created successfully.",
            ticket
        });

    } catch (error) {
        console.error("Create Ticket Error:", error);

        res.status(500).json({
            message: "Failed to create ticket.",
            error: error.message
        });
    }
};

// Get all tickets
const getTickets = async (req, res) => {
    try {
        // Agent can see all tickets.
        // Customer can see only their own tickets.
        const filter =
            req.user.role === "agent"
                ? {}
                : { customerId: req.user.id };

        const tickets = await Ticket.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Tickets fetched successfully.",
            count: tickets.length,
            tickets
        });

    } catch (error) {
        console.error("Get Tickets Error:", error);

        res.status(500).json({
            message: "Failed to fetch tickets.",
            error: error.message
        });
    }
};

// Get a ticket by Ticket ID
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            ticketId: req.params.ticketId
        });

        // Ticket doesn't exist
        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found."
            });
        }

        // Customer can access only their own ticket.
        // Agent can access any ticket.
        if (!canAccessTicket(ticket, req.user)) {
            return res.status(403).json({
                message: "You are not authorized to access this ticket."
            });
        }

        res.status(200).json(ticket);

    } catch (error) {
        console.error("Get Ticket Error:", error);

        res.status(500).json({
            message: "Failed to fetch ticket."
        });
    }
};
// Public ticket tracking
const trackTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            ticketId: req.params.ticketId
        }).select(
            "ticketId subject status statusHistory createdAt updatedAt"
        );

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found."
            });
        }

        res.status(200).json(ticket);

    } catch (error) {
        console.error("Track Ticket Error:", error);

        res.status(500).json({
            message: "Failed to track ticket."
        });
    }
};


module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    trackTicket
};
