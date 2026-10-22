import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const statusLabel = (status) => (status || "submitted").replaceAll("_", " ");

function AdminTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadTicket() {
      try {
        const response = await api.get(`/tickets/${ticketId}`);
        if (!ignore) {
          setTicket(response.data);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Error fetching admin ticket:", error);
        if (!ignore) {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          } else if (error.response?.status !== 404) {
            setErrorMessage(
              error.response?.data?.message ||
                error.message ||
                "Unable to load ticket. Please try again."
            );
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTicket();
    return () => {
      ignore = true;
    };
  }, [ticketId, navigate]);

  if (loading) {
    return <main className="admin-shell admin-detail-shell">Loading ticket…</main>;
  }

  if (!ticket || errorMessage) {
    return (
      <main className="admin-shell admin-detail-shell">
        <div className="admin-not-found">
          <span>?</span>
          <h1>{errorMessage ? "Unable to load ticket" : "Ticket not found"}</h1>
          <p>{errorMessage || "We couldn't find that ticket."}</p>
          <button className="admin-export-button" onClick={() => navigate("/admin")}>← Back to tickets</button>
        </div>
      </main>
    );
  }

  const department = ticket.suggestedTeam || ticket.category || "Unassigned";
  const priority = ticket.priority || "Normal";
  const statusHistory = ticket.statusHistory || [];

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
        <header className="admin-topbar"><div className="admin-breadcrumb"><button onClick={() => navigate("/admin")}>Tickets</button><span>/</span><strong>{ticket.ticketId}</strong></div><div className="admin-top-actions"><span className="admin-top-avatar">AD</span></div></header>
        <div className="admin-content admin-detail-content">
          <button className="admin-back-link" onClick={() => navigate("/admin")}>← <span>Back to all tickets</span></button>
          <div className="admin-detail-heading"><div><div className="admin-detail-id">{ticket.ticketId}</div><h1>{ticket.subject}</h1><p>Submitted by {ticket.customerName || "Unknown"} <span>·</span> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable"}</p></div><span className={`admin-status admin-status-${ticket.status || "submitted"}`}><i />{statusLabel(ticket.status)}</span></div>

          <div className="admin-detail-grid">
            <div className="admin-detail-main">
              <section className="admin-panel admin-detail-description"><div className="admin-panel-heading"><div><h2>Ticket details</h2><p>What the user reported</p></div></div><p>{ticket.description || "No description provided."}</p></section>
              <section className="admin-panel admin-timeline-panel"><div className="admin-panel-heading"><div><h2>Ticket updates</h2><p>Status and assignment history</p></div></div>
                <div className="admin-timeline">{statusHistory.map((event, index) => (
                  <div className="admin-timeline-event" key={`${event.status}-${index}`}>
                    <span className={`admin-timeline-marker ${index === statusHistory.length - 1 ? "current" : ""}`}>{index === statusHistory.length - 1 ? "✓" : ""}</span>
                    <div className="admin-timeline-event-body"><div className="admin-timeline-event-title"><strong>{event.note || statusLabel(event.status)}</strong><span className={`admin-status admin-status-small admin-status-${event.status || "submitted"}`}>{statusLabel(event.status)}</span></div><p>{event.actor === "system" ? "Automated triage" : event.actor === "customer" ? ticket.customerName || "Customer" : "Support team"}</p>{event.updatedAt && <time>{new Date(event.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>}</div>
                  </div>
                ))}{statusHistory.length === 0 && <p>No updates logged yet.</p>}</div>
              </section>
            </div>
            <aside className="admin-detail-aside">
              <section className="admin-panel admin-information-panel"><div className="admin-panel-heading"><div><h2>Ticket information</h2></div></div>
                <div className="admin-info-field"><span>Department</span><strong><i className="department-info-dot" />{department}</strong></div>
                <div className="admin-info-field"><span>Category</span><strong>{ticket.category || "Uncategorized"}</strong></div>
                <div className="admin-info-field"><span>Priority</span><strong className={`priority-text-${priority.toLowerCase()}`}><i className={`priority-dot priority-${priority.toLowerCase()}`} />{priority}</strong></div>
                <div className="admin-info-field"><span>Related item</span><strong>{ticket.item || "None"}</strong></div>
                <div className="admin-info-field"><span>Ticket ID</span><strong className="ticket-id-copy">{ticket.ticketId}</strong></div>
              </section>
              <section className="admin-panel admin-requester-panel"><div className="admin-panel-heading"><div><h2>Requester</h2></div></div><div className="admin-requester"><span>{(ticket.customerName || "U").split(" ").map((part) => part[0]).join("")}</span><div><strong>{ticket.customerName || "Unknown"}</strong><small>Ticket submitter</small></div></div><div className="admin-info-field"><span>Email</span><strong className="requester-email">{ticket.contactDetails || "None provided"}</strong></div></section>
              <div className="admin-ai-note"><span>✦</span><div><strong>Department suggestion</strong><p>This ticket was assigned to <b>{department}</b> under {(ticket.category || "uncategorized").toLowerCase()}.</p></div></div>
            </aside>
          </div>
          <footer className="admin-page-footer">SupportDesk <span>-</span> Admin</footer>
        </div>
      </main>
    </div>
  );
}

export default AdminTicketDetails;
