const router = require("express").Router();
const axios = require("axios");
const Ticket = require("../models/ticket");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { emailCustomer, redraftReply } = require("../services/review");

// Fields a customer may set; status, draftReply, category etc. are written by n8n / admins only
const CUSTOMER_FIELDS = ["customerName", "subject", "item", "serviceDate", "problem", "yourEmail"];

router.post("/", auth, async (req, res) => {
  try {
    const ticketId = "TKT-" + Date.now().toString(36).toUpperCase();
    const fields = Object.fromEntries(
      CUSTOMER_FIELDS.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]])
    );
    const ticket = await Ticket.create({
       ...fields, ticketId, user: req.user.id,
       statusHistory: [{ status: "new",
        note: "Ticket submitted", actor: "customer" }] });

    try {
      if (!process.env.N8N_WEBHOOK_URL) throw new Error("N8N_WEBHOOK_URL is not set");
      // Timeout so a dead ngrok tunnel can't hang the request until Vercel kills the function
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        ticketId: ticket.ticketId,
        "Customer Name": ticket.customerName,
        Subject: ticket.subject,
        Problem: ticket.problem,
        Item: ticket.item,
        "Service Date": ticket.serviceDate,
        "Your Email": ticket.yourEmail,
        submittedAt: ticket.submittedAt,
        formMode: "web"
      }, { timeout: 10000 });
    } catch (err) {
      console.error("n8n webhook failed:", err.message);
    }

    res.status(201).json({ ticket });
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: "Please fill in all ticket fields correctly" });
    }
    console.error("Create ticket failed:", err);
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

router.patch("/admin/:ticketId", adminAuth, async (req, res) => {
  try{


    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId.toUpperCase() })
    if(!ticket) return res.status(404).json({message : "Ticket not found"});

    const previousStatus = ticket.status;
    const editable = ["status", "urgency", "department", "category"];

    editable.forEach((field) => {

      if (typeof req.body[field] === "string" && req.body[field].trim()){

        ticket[field] = req.body[field].trim();
      }

    })

    if(previousStatus !== ticket.status){
      ticket.statusHistory.push({
        status : ticket.status,
        note : `Status changed to ${ticket.status.replaceAll("_", " ")}`,
        actor : "admin"
      })
    }

    await ticket.save();
    res.json(ticket);

  }catch(err){
    console.error("PATCH ticket failed:", err);
    res.status(500).json({ message: "Failed to update ticket" });
  }
})

// Admin review of the AI draft reply (replaces the old Telegram approve/reject buttons)
router.post("/admin/:ticketId/review", adminAuth, async (req, res) => {
  try {
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "action must be approve or reject" });
    }

    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId.toUpperCase() });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const warnings = [];

    if (action === "approve") {
      ticket.status = "resolved";
      ticket.statusHistory.push({ status: "resolved", note: "Draft reply approved", actor: "admin" });
      try {
        await emailCustomer(ticket);
      } catch (err) {
        console.error("Customer email failed:", err.message);
        warnings.push("Ticket approved, but the customer email could not be sent.");
      }
    } else {
      ticket.status = "awaiting_approval";
      try {
        ticket.draftReply = await redraftReply(ticket);
        ticket.statusHistory.push({ status: "awaiting_approval", note: "Draft rejected, new draft generated", actor: "admin" });
      } catch (err) {
        console.error("Redraft failed:", err.message);
        ticket.statusHistory.push({ status: "awaiting_approval", note: "Draft rejected", actor: "admin" });
        warnings.push("Draft rejected, but a new draft could not be generated.");
      }
    }

    await ticket.save();
    res.json({ ticket, warnings });
  } catch (err) {
    console.error("Review failed:", err);
    res.status(500).json({ message: "Failed to review ticket" });
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