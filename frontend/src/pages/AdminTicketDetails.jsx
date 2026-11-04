import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { normalizeTicket } from "../utils/normalizeTicket";
import { adminTicketValidators, CATEGORY_OPTIONS, DEPARTMENT_OPTIONS, EDITABLE_STATUS_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS, statusLabel } from "../utils/validation";
import { useFieldErrors } from "../utils/useFieldErrors";
import FieldError from "../components/FieldError";
import "../Admin.css";

// ADMIN ONLY page. Shows one ticket in full: description, update history,
// department/priority and who submitted it.
// Fetched from the backend (GET /tickets/admin/:ticketId, admin token required).

const EDIT_FIELDS = [
  { name: "department", label: "Department", options: DEPARTMENT_OPTIONS },
  { name: "category", label: "Category", options: CATEGORY_OPTIONS },
  { name: "status", label: "Status", options: EDITABLE_STATUS_OPTIONS },
  { name: "urgency", label: "Priority", options: PRIORITY_OPTIONS }
];

// A stored value outside the allowed list becomes "" so the admin has to pick a valid one
const allowedValue = (value, options) => (options.some(([allowed]) => allowed === value) ? value : "");

// A ticket n8n left on another status (e.g. classified) keeps it as an extra choice,
// so editing another field does not force a status change
const statusChoices = (current) => (
  EDITABLE_STATUS_OPTIONS.some(([value]) => value === current)
    ? EDITABLE_STATUS_OPTIONS
    : [...EDITABLE_STATUS_OPTIONS, ...STATUS_OPTIONS.filter(([value]) => value === current)]
);

// Hides the sign-off in the Suggested reply box. The saved draft, and so the customer email, keeps it.
// Only a signature on its own last line matches, so the name inside a sentence is left alone.
const SIGNATURE = /(?:\n[ \t]*(?:kind regards|best regards|regards|sincerely)[,.]?[ \t]*)?\s*\n[ \t]*(?:the )?(?:los polos hermanos|support team)[ \t.]*\s*$/i;
const withoutSignature = (reply) => reply.replace(SIGNATURE, "").trimEnd();

function AdminTicketDetails() {
  // ticketId comes from the URL, e.g. /admin/tickets/TKT-1001
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editValues, setEditValues] = useState({ status: "", urgency: "", department: "", category: "" });
  const { errors, recheckField, checkAll, clearErrors } = useFieldErrors(adminTicketValidators);

  // Load this ticket from the backend; `ticket` stays null if it is missing or the request fails
  useEffect(() => {
    let ignore = false;
    const loadTicket = async () => {
      try {
        const response = await api.get(`/tickets/admin/${ticketId}`);
        if (!ignore) setTicket(normalizeTicket(response.data));
      } catch (error) {
        console.error("Error fetching ticket:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadTicket();
    return () => {
      ignore = true;
    };
  }, [ticketId, navigate]);

  const startEditing = () => {
    setEditValues({
      status: allowedValue(ticket.status, STATUS_OPTIONS),
      urgency: allowedValue(ticket.urgency.toLowerCase(), PRIORITY_OPTIONS),
      department: allowedValue(ticket.department, DEPARTMENT_OPTIONS),
      category: allowedValue(ticket.category.toLowerCase(), CATEGORY_OPTIONS)
    });
    clearErrors();
    setEditing(true);
  };

  // Save the edited fields to the backend (PATCH /tickets/admin/:ticketId) and show the saved ticket
  const saveChanges = async () => {
    if (!checkAll(editValues)) return;
    setSaving(true);
    setSaveError("");
    try {
      const response = await api.patch(`/tickets/admin/${ticketId}`, editValues);
      setTicket(normalizeTicket(response.data));
      setEditing(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
      setSaveError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-shell admin-detail-shell">
        <div className="admin-not-found admin-loading"><h1>Loading ticket…</h1></div>
      </main>
    );
  }

  // No matching ticket: show a "not found" screen with a way back
  if (!ticket) {
    return (
      <main className="admin-shell admin-detail-shell">
        <div className="admin-not-found"><h1>Ticket not found</h1><p>We couldn't find that ticket.</p><button className="admin-export-button" onClick={() => navigate("/admin")}>Back to tickets</button></div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      {/* Left sidebar (same as the admin dashboard): menu links go back to /admin; the arrow signs out */}
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate("/admin")}><span className="admin-brand-mark">LP</span><span>Los Polos Hermanos<span className="admin-brand-period">.</span></span></button>
        <p className="admin-nav-label">MENU</p>
        <button className="admin-nav-item" onClick={() => navigate("/admin")}>Dashboard</button>
        <div className="admin-sidebar-footer"><span className="admin-avatar">AD</span><span><strong>Administrator</strong></span></div>
      </aside>

      <main className="admin-main">
        {/* Top bar: breadcrumb "Tickets / <ticket id>" */}
        <header className="admin-topbar"><div className="admin-breadcrumb"><button onClick={() => navigate("/admin")}>Tickets</button><span>/</span><strong>{ticket.ticketId}</strong></div><div className="admin-top-actions"><span className="admin-top-avatar">AD</span>
          {/* Sign out: same behaviour as the user dashboard (clear session, go to login) */}
          <button type="button" className="admin-signout-button" title="Sign out" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>Sign out</button>
        </div></header>
        <div className="admin-content admin-detail-content">
          <button className="admin-back-link" onClick={() => navigate("/admin")}><span>Back to all tickets</span></button>
          {/* Heading: ticket id, subject, submitter, submitted time and current status badge */}
          <div className="admin-detail-heading"><div><div className="admin-detail-id">{ticket.ticketId}</div><h1>{ticket.subject}</h1><p>Submitted by {ticket.customerName} <span>·</span> {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p></div><span className={`admin-status admin-status-${ticket.status}`}>{statusLabel(ticket.status)}</span></div>

          {/* Two columns: description + updates (left), ticket info + requester (right) */}
          <div className="admin-detail-grid">
            <div className="admin-detail-main">
              {/* What the user wrote when submitting the ticket */}
              <section className="admin-panel admin-detail-description"><div className="admin-panel-heading"><div><h2>Ticket details</h2><p>What the user reported</p></div></div><p>{ticket.problem}</p></section>
              {/* AI draft reply, read-only here: approval happens through Telegram */}
              {ticket.draftReply && (
                <section className="admin-panel admin-detail-description"><div className="admin-panel-heading"><div><h2>Suggested reply</h2><p>{ticket.status === "awaiting_approval" ? "Review the AI draft before it goes to the customer" : "AI draft reply"}</p></div></div>
                  <p>{withoutSignature(ticket.draftReply)}</p>
                </section>
              )}
              {/* Update history. actor: "system" = automated triage, "customer" = the user, anything else = an admin. The last event is marked as current. */}
              <section className="admin-panel admin-timeline-panel"><div className="admin-panel-heading"><div><h2>Ticket updates</h2><p>Status and assignment history</p></div></div>
                <div className="admin-timeline">{ticket.statusHistory.map((event, index) => (
                  <div className="admin-timeline-event" key={`${event.status}-${index}`}>
                    <span className="admin-timeline-marker"></span>
                    <div className="admin-timeline-event-body"><div className="admin-timeline-event-title"><strong>{event.note}</strong><span className={`admin-status admin-status-small admin-status-${event.status}`}>{statusLabel(event.status)}</span></div><p>{event.actor === "system" ? "Automated triage" : event.actor === "customer" ? ticket.customerName : "Admin"}</p><time>{new Date(event.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></div>
                  </div>
                ))}</div>
              </section>
            </div>
            <aside className="admin-detail-aside">
              {/* Ticket facts: department, category, priority, related item, id */}
              <section className="admin-panel admin-information-panel"><div className="admin-panel-heading"><div><h2>Ticket information</h2></div>
                {!editing && <button type="button" className="admin-edit-button" onClick={startEditing}>Edit</button>}
              </div>
                {editing ? (
                  <>
                    {EDIT_FIELDS.map(({ name, label, options }) => (
                      <label className="admin-info-field admin-edit-field" key={name}><span>{label}</span>
                        <select
                          name={name}
                          value={editValues[name]}
                          aria-invalid={errors[name] ? true : undefined}
                          aria-describedby={errors[name] ? `${name}-error` : undefined}
                          onChange={(event) => {
                            const nextValues = { ...editValues, [name]: event.target.value };
                            setEditValues(nextValues);
                            recheckField(name, nextValues);
                          }}
                        >
                          {!editValues[name] && <option value="" disabled>Select…</option>}
                          {(name === "status" ? statusChoices(ticket.status) : options).map(([value, optionLabel]) => <option key={value} value={value}>{optionLabel}</option>)}
                        </select>
                        <FieldError name={name} message={errors[name]} />
                      </label>
                    ))}
                    {saveError && <p className="admin-edit-note">{saveError}</p>}
                    <div className="admin-edit-actions">
                      <button type="button" className="admin-edit-cancel" onClick={() => { setEditing(false); setSaveError(""); clearErrors(); }}>Cancel</button>
                      <button type="button" className="admin-edit-save" onClick={saveChanges} disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="admin-info-field"><span>Department</span><strong>{ticket.department}</strong></div>
                    <div className="admin-info-field"><span>Category</span><strong className="admin-info-status">{ticket.category}</strong></div>
                    <div className="admin-info-field"><span>Status</span><strong className="admin-info-status">{statusLabel(ticket.status)}</strong></div>
                    <div className="admin-info-field"><span>Priority</span><strong className={`priority-text-${ticket.urgency.toLowerCase()}`}>{ticket.urgency}</strong></div>
                  </>
                )}
                <div className="admin-info-field"><span>Related item</span><strong>{ticket.item}</strong></div>
                <div className="admin-info-field"><span>Ticket ID</span><strong className="ticket-id-copy">{ticket.ticketId}</strong></div>
              </section>
              {/* The user who submitted the ticket (initials avatar, name, email) */}
              <section className="admin-panel admin-requester-panel"><div className="admin-panel-heading"><div><h2>Requester</h2></div></div><div className="admin-requester"><span>{ticket.customerName.split(" ").map((part) => part[0]).join("")}</span><div><strong>{ticket.customerName}</strong><small>Ticket submitter</small></div></div><div className="admin-info-field"><span>Email</span><strong className="requester-email">{ticket.yourEmail}</strong></div></section>
              {/* Short note on which department the ticket was routed to */}
              
            </aside>
          </div>
          <footer className="admin-page-footer"> </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminTicketDetails;
