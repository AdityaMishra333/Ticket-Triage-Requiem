// Fills in values the admin pages rely on, because tickets saved by the backend may not have
// them yet (department, priority and category are written later by the triage workflow).
export function normalizeTicket(ticket) {
  const status = !ticket.status || ticket.status === "pending" ? "submitted" : ticket.status;
  return {
    ...ticket,
    status,
    priority: ticket.priority || "Low",
    department: ticket.department || "Unassigned",
    category: ticket.category || "General",
    customerName: ticket.customerName || "Unknown",
    statusHistory: ticket.statusHistory?.length
      ? ticket.statusHistory
      : [{ status, note: "Ticket submitted", actor: "customer", updatedAt: ticket.createdAt }]
  };
}
