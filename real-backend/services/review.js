const axios = require("axios");
const nodemailer = require("nodemailer");

async function emailCustomer(ticket) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER / SMTP_PASS not set");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: ticket.yourEmail,
    subject: `Re: ${ticket.subject} (${ticket.ticketId})`,
    text: ticket.draftReply ||
      "Your issue will be resolved soon, the problem is now handed to the responsible department."
  });
}

async function redraftReply(ticket) {
  const url = process.env.OLLAMA_URL || "http://localhost:11434";
  const { data } = await axios.post(`${url}/api/chat`, {
    model: process.env.OLLAMA_MODEL || "qwen2.5:latest",
    stream: false,
    messages: [{
      role: "user",
      content: `The previous draft was rejected by a human reviewer. Write a different, improved reply — change the tone and wording.\n\nOld Draft Message: ${ticket.draftReply}\n\nCustomer's complaint: ${ticket.problem}\n\nProduct/item: ${ticket.item}\n\nIssue category: ${ticket.category}\n\nUrgency: ${ticket.urgency}\n\n`
    }]
  }, { timeout: 120000 });
  return data.message.content;
}

module.exports = { emailCustomer, redraftReply };
