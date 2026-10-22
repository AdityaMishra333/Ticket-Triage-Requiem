const router = require("express").Router();
const axios = require("axios");
const Ticket = require("../models/ticket");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

router.post("/", auth, async (req, res) => {
  try {
    const ticketId = "TKT-" + Date.now().toString(36).toUpperCase();
    const ticket = await Ticket.create({
       ...req.body, ticketId, user: req.user?.id, 
       statusHistory: [{ status: "submitted", 
        note: "Ticket submitted", actor: "customer" }] });

    try {
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        ticketId: ticket.ticketId,
        "Customer Name": ticket.customerName,
        Subject: ticket.subject,
        Problem: ticket.description,
        Item: ticket.item,
        "Service Date": ticket.serviceDate,
        "Your Email": ticket.contactDetails,
        submittedAt: ticket.createdAt,
        formMode: "web"
      });
    } catch (err) {
      console.error("n8n webhook failed:", err.message);
    }

    res.status(201).json({ ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

router.get("/track/:ticketId", auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId.toUpperCase(), user: req.user.id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

router.get("/admin/:ticketId", adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId.toUpperCase() });
    if (!ticket) 
      return res.status(404).json({ message: "Ticket not found" });
    
    res.json(ticket);
  } catch (err) {

    res.status(500).json({ message: "Failed to fetch ticket" });

  }
});

router.get("/:ticketId", auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId.toUpperCase(), user: req.user.id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

module.exports = router;