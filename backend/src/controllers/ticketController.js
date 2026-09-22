const Ticket = require("../models/Ticket");

const canAccessTicket = (ticket, user) =>
  user.role === "agent" || ticket.customerId.toString() === user.id;

// Create a new ticket
const createTicket = async (req, res) => {
  try {
    const { subject, description, contactDetails } = req.body;

    // Validate required fields
    if (!subject || !description || !contactDetails) {
      return res.status(400).json({
        message: "Subject, description and contact details are required."
      });
    }

    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create ticket
    const ticket = await Ticket.create({
      ticketId,
      customerId: req.user.id,
      subject,
      description,
      contactDetails,
      status: "submitted",
      statusHistory: [
        {
          status: "submitted",
          actor: "customer"
        }
      ]
    });

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
        const filter = req.user.role === "agent"
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

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });

        if (!ticket || !canAccessTicket(ticket, req.user)) {
            return res.status(404).json({
                message: "Ticket not found."
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

module.exports = {
  createTicket,
  getTickets,
  getTicketById
};