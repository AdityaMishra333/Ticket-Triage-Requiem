import { useNavigate, useParams } from "react-router-dom";

const statusLabel = (status) => (status || "submitted").replaceAll("_", " ");

function AdminTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const ticket = adminTickets.find((item) => item.ticketId.toLowerCase() === ticketId?.toLowerCase());

  if (!ticket) {
    return (
      <main className="admin-shell admin-detail-shell">
        <div className="admin-not-found"><span>?</span><h1>Ticket not found</h1><p>We couldn't find that ticket.</p><button className="admin-export-button" onClick={() => navigate("/admin")}>← Back to tickets</button></div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate("/admin")}><span className="admin-brand-mark">S</span><span>supportdesk<span className="admin-brand-period">.</span></span></button>
        <div className="admin-workspace"><span className="admin-workspace-icon">A</span><span><strong>Support team</strong><small>Admin</small></span><span className="admin-workspace-chevron">⌄</span></div>
        <p className="admin-nav-label">MENU</p>
        <button className="admin-nav-item" onClick={() => navigate("/admin")}><span>▦</span> Overview</button>
        <button className="admin-nav-item active" onClick={() => navigate("/admin")}><span>▤</span> All tickets</button>
        <div className="admin-sidebar-footer"><span className="admin-avatar">AD</span><span><strong>Administrator</strong><small>Support team</small></span><button aria-label="Sign out" title="Sign out" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>↗</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div className="admin-breadcrumb"><button onClick={() => navigate("/admin")}>Tickets</button><span>/</span><strong>{ticket.ticketId}</strong></div><div className="admin-top-actions"><span className="admin-sample-pill"><span /> Sample data</span><span className="admin-top-avatar">AD</span></div></header>
        <div className="admin-content admin-detail-content">
          <button className="admin-back-link" onClick={() => navigate("/admin")}>← <span>Back to all tickets</span></button>
          <div className="admin-detail-heading"><div><div className="admin-detail-id">{ticket.ticketId}</div><h1>{ticket.subject}</h1><p>Submitted by {ticket.customerName} <span>·</span> {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p></div><span className={`admin-status admin-status-${ticket.status}`}><i />{statusLabel(ticket.status)}</span></div>
          <div className="admin-demo-notice" role="note"><span>ⓘ</span><div><strong>Sample ticket</strong><span>This is example data. Updates are not saved.</span></div></div>

          <div className="admin-detail-grid">
            <div className="admin-detail-main">
              <section className="admin-panel admin-detail-description"><div className="admin-panel-heading"><div><h2>Ticket details</h2><p>What the user reported</p></div></div><p>{ticket.description}</p></section>
              <section className="admin-panel admin-timeline-panel"><div className="admin-panel-heading"><div><h2>Ticket updates</h2><p>Status and assignment history</p></div><span className="tracking-live-dot">● Example updates</span></div>
                <div className="admin-timeline">{ticket.statusHistory.map((event, index) => (
                  <div className="admin-timeline-event" key={`${event.status}-${index}`}>
                    <span className={`admin-timeline-marker ${index === ticket.statusHistory.length - 1 ? "current" : ""}`}>{index === ticket.statusHistory.length - 1 ? "✓" : ""}</span>
                    <div className="admin-timeline-event-body"><div className="admin-timeline-event-title"><strong>{event.note}</strong><span className={`admin-status admin-status-small admin-status-${event.status}`}>{statusLabel(event.status)}</span></div><p>{event.actor === "system" ? "Automated triage" : event.actor === "customer" ? ticket.customerName : "Support team"}</p><time>{new Date(event.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></div>
                  </div>
                ))}</div>
              </section>
            </div>
            <aside className="admin-detail-aside">
              <section className="admin-panel admin-information-panel"><div className="admin-panel-heading"><div><h2>Ticket information</h2></div></div>
                <div className="admin-info-field"><span>Department</span><strong><i className="department-info-dot" />{ticket.department}</strong></div>
                <div className="admin-info-field"><span>Category</span><strong>{ticket.category}</strong></div>
                <div className="admin-info-field"><span>Priority</span><strong className={`priority-text-${ticket.priority.toLowerCase()}`}><i className={`priority-dot priority-${ticket.priority.toLowerCase()}`} />{ticket.priority}</strong></div>
                <div className="admin-info-field"><span>Related item</span><strong>{ticket.item}</strong></div>
                <div className="admin-info-field"><span>Ticket ID</span><strong className="ticket-id-copy">{ticket.ticketId}</strong></div>
              </section>
              <section className="admin-panel admin-requester-panel"><div className="admin-panel-heading"><div><h2>Requester</h2></div></div><div className="admin-requester"><span>{ticket.customerName.split(" ").map((part) => part[0]).join("")}</span><div><strong>{ticket.customerName}</strong><small>Ticket submitter</small></div></div><div className="admin-info-field"><span>Email</span><strong className="requester-email">{ticket.contactDetails}</strong></div></section>
              <div className="admin-ai-note"><span>✦</span><div><strong>Department suggestion</strong><p>This ticket was assigned to <b>{ticket.department}</b> under {ticket.category.toLowerCase()}.</p></div></div>
            </aside>
          </div>
          <footer className="admin-page-footer">SupportDesk <span>-</span> Admin</footer>
        </div>
      </main>
    </div>
  );
}

export default AdminTicketDetails;
