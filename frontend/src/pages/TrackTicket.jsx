import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function TrackTicket() {
  const navigate = useNavigate();
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const trackTicket = async (event) => {
    event.preventDefault();
    const requestedId = ticketId.trim();
    setTicket(null);
    setMessage("");

    if (!requestedId) {
      setMessage("Please enter a ticket reference ID.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(
        `/tickets/track/${encodeURIComponent(requestedId)}`
      );

      if (response.data.ticketId?.toLowerCase() !== requestedId.toLowerCase()) {
        setMessage("The returned ticket could not be verified. Please check the ID.");
        return;
      }
      setTicket(response.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "No ticket found with that reference ID. Please check your confirmation.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="dashboard-bg">
      <Navbar />

      <div className="page-container-narrow">
        <div className="form-panel">
          <div className="form-header-simple">
            <h1>Track a request</h1>
            <p>Enter your ticket ID to check its current status.</p>
          </div>

          <form onSubmit={trackTicket}>
            <div className="form-group-field">
              <label className="field-label" htmlFor="track-ticket-id">
                Ticket Reference ID
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  id="track-ticket-id"
                  className="field-input"
                  type="text"
                  placeholder="e.g. TKT-1718293847291-382"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Look up"}
                </button>
              </div>
            </div>

            {message && (
              <div className="form-feedback error" role="alert" style={{ marginTop: "12px" }}>
                <span>{message}</span>
              </div>
            )}
          </form>

          {ticket && (
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-subtle)", padding: "2px 6px", borderRadius: "4px" }}>
                    #{ticket.ticketId}
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginTop: "6px" }}>
                    {ticket.subject}
                  </h3>
                </div>
                <div>{getStatusBadge(ticket.status)}</div>
              </div>

              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
                {ticket.description}
              </p>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: "100%" }}
                onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
              >
                View full ticket updates →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackTicket;