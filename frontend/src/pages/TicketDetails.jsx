import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;
    const loadTicket = async () => {
      try {
        const response = await api.get(`/tickets/${ticketId}`);
        if (!ignore) {
          setTicket(response.data);
        }
      } catch (error) {
        console.error("Error fetching ticket:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(error.response?.data?.message || "Unable to load ticket");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTicket();
    return () => {
      ignore = true;
    };
  }, [ticketId, navigate]);

  const copyTicketId = () => {
    if (!ticket?.ticketId) return;
    navigator.clipboard.writeText(ticket.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const norm = (status || "").toLowerCase();
    let display = norm.replace("_", " ");
    return (
      <span className={`status-badge ${norm}`}>
        <span className="dot"></span>
        {display || "Submitted"}
      </span>
    );
  };

  const formatActivityText = (item) => {
    const s = (item.status || "").toLowerCase();
    const actor = item.actor === "customer" ? "You" : item.actor === "agent" ? "Support Agent" : "System";

    if (s === "submitted") return `Ticket created by ${actor}`;
    if (s === "assigned") return `Assigned for investigation (${actor})`;
    if (s === "in_progress") return `Status changed to In Progress by ${actor}`;
    if (s === "resolved") return `Issue marked as Resolved by ${actor}`;
    if (s === "closed") return `Ticket closed by ${actor}`;
    return `Status changed to ${s.replace("_", " ")} by ${actor}`;
  };

  return (
    <div>
      <Navbar />

      <main className="details-page">
        <button
          className="back-link"
          onClick={() => navigate("/dashboard")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to all tickets
        </button>

        {loading ? (
          <div className="content-panel">
            <div className="skeleton-box" style={{ width: "120px", height: "18px", marginBottom: "14px" }}></div>
            <div className="skeleton-box" style={{ width: "60%", height: "24px", marginBottom: "20px" }}></div>
            <div className="skeleton-box" style={{ width: "100%", height: "100px" }}></div>
          </div>
        ) : !ticket ? (
          <div className="content-panel" style={{ textAlign: "center", padding: "40px" }}>
            <h3>Ticket not found</h3>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 20px" }}>
              We couldn't find a ticket matching ID #{ticketId}.
            </p>
            <button className="btn-primary" onClick={() => navigate("/dashboard")}>
              Return to tickets
            </button>
          </div>
        ) : (
          <div className="details-layout">
            {/* Main Details Panel */}
            <div>
              <div className="content-panel">
                <div className="ticket-header-block">
                  <span className="ticket-id-tag">#{ticket.ticketId}</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <h1 className="ticket-headline">{ticket.subject}</h1>
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>

                <div>
                  <div className="section-subhead">Description</div>
                  <div className="desc-text-box">{ticket.description}</div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="content-panel">
                <div className="section-subhead">Activity & Status History</div>

                {ticket.statusHistory && ticket.statusHistory.length > 0 ? (
                  <div className="activity-stream">
                    {ticket.statusHistory.map((item, index) => (
                      <div className="activity-item" key={index}>
                        <div className="activity-point"></div>
                        <div className="activity-content">
                          <div className="activity-meta">
                            <span className="activity-author">{formatActivityText(item)}</span>
                            {item.updatedAt && (
                              <span className="activity-timestamp">
                                {new Date(item.updatedAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
                    No updates logged yet.
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar Meta Panel */}
            <div>
              <div className="content-panel">
                <div className="section-subhead">Ticket Information</div>

                <div className="meta-field">
                  <div className="meta-field-label">Ticket ID</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                      {ticket.ticketId}
                    </span>
                    <button
                      className="btn-ghost"
                      style={{ padding: "2px 6px", fontSize: "12px" }}
                      onClick={copyTicketId}
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="meta-field">
                  <div className="meta-field-label">Status</div>
                  <div style={{ marginTop: "4px" }}>
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>

                <div className="meta-field">
                  <div className="meta-field-label">Contact Details</div>
                  <div className="meta-field-value">
                    {ticket.contactDetails || "None provided"}
                  </div>
                </div>

                {ticket.createdAt && (
                  <div className="meta-field">
                    <div className="meta-field-label">Created</div>
                    <div className="meta-field-value" style={{ fontWeight: 500, fontSize: "13px" }}>
                      {new Date(ticket.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "20px" }}>
                  <button
                    className="btn-secondary"
                    style={{ width: "100%" }}
                    onClick={() => navigate("/create-ticket")}
                  >
                    + Submit another request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TicketDetails;