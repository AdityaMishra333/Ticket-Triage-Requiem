export function normalizeTicket(ticket) {
  const status = !ticket.status || ticket.status === "pending" ? "new" : ticket.status;
  return {
    ...ticket,
    status,
    urgency: ticket.urgency || "low",
    department: ticket.department || "Unassigned",
    category: ticket.category || "General",
    customerName: ticket.customerName || "Unknown",
    statusHistory: ticket.statusHistory?.length
      ? ticket.statusHistory
      : [{ status, note: "Ticket submitted", actor: "customer", updatedAt: ticket.createdAt }]
  };
}
