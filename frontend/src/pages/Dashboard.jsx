import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { LIMITS, statusLabel } from "../utils/validation";
import { normalizeTicket } from "../utils/normalizeTicket";

const OPEN_STATUSES = ["new", "classified", "awaiting_approval"];
const IN_PROGRESS_STATUSES = ["resolving", "in_progress"];

function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    let ignore = false;
    const loadTickets = async () => {
      try {
        const response = await api.get("/tickets");
        if (!ignore) {
          setTickets((response.data.tickets || []).map(normalizeTicket));
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTickets();
    return () => {
      ignore = true;
    };
  }, [navigate]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const submitted = tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length;
    const inProgress = tickets.filter((t) => IN_PROGRESS_STATUSES.includes(t.status)).length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;

    return { total, submitted, inProgress, resolved };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (ticket.subject || "").toLowerCase().includes(q) ||
        (ticket.ticketId || "").toLowerCase().includes(q) ||
        (ticket.problem || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "submitted") return OPEN_STATUSES.includes(ticket.status);
      if (statusFilter === "in_progress") return IN_PROGRESS_STATUSES.includes(ticket.status);
      return ticket.status === statusFilter;
    });
  }, [tickets, searchQuery, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Recent";

    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    const norm = (status || "").toLowerCase();
    return (
      <span className={`status-badge ${norm}`}>
        {statusLabel(status)}
      </span>
    );
  };

  return (
    <div className="dashboard-bg">
      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-header-row">
          <div>
            <h1>My Tickets</h1>
            <p>Track, view, and manage your reported requests.</p>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/create-ticket")}
          >
            New Request
          </button>
        </div>

        <section className="metrics-ribbon">
          <div className="metric-item">
            <span className="metric-num">{stats.total}</span>
            <span className="metric-label">Total requests</span>
          </div>
          <div className="metric-item">
            <span className="metric-num">{stats.submitted}</span>
            <span className="metric-label">Awaiting response</span>
          </div>
          <div className="metric-item">
            <span className="metric-num">{stats.inProgress}</span>
            <span className="metric-label">Working</span>
          </div>
          <div className="metric-item">
            <span className="metric-num">{stats.resolved}</span>
            <span className="metric-label">Resolved</span>
          </div>
        </section>

        <section className="dashboard-toolbar">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              className={`tab-btn ${statusFilter === "submitted" ? "active" : ""}`}
              onClick={() => setStatusFilter("submitted")}
            >
              Open
            </button>
            <button
              className={`tab-btn ${statusFilter === "in_progress" ? "active" : ""}`}
              onClick={() => setStatusFilter("in_progress")}
            >
              Working
            </button>
            <button
              className={`tab-btn ${statusFilter === "resolved" ? "active" : ""}`}
              onClick={() => setStatusFilter("resolved")}
            >
              Resolved
            </button>
          </div>

          <div className="toolbar-controls">
            <div className="search-input-wrapper">
              <input
                className="search-input-field"
                type="text"
                aria-label="Search by subject or ID"
                placeholder="Search by subject or ID"
                maxLength={LIMITS.search.max}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view"
              >List
              </button>
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Card view"
              >Cards
              </button>
            </div>
          </div>
        </section>

        <section>
          {loading ? (
            <div className="ticket-list-table">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-box" style={{ width: "120px" }}></div>
                  <div className="skeleton-box" style={{ flex: 1 }}></div>
                  <div className="skeleton-box" style={{ width: "90px" }}></div>
                  <div className="skeleton-box" style={{ width: "80px" }}></div>
                </div>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="ticket-list-table">
              <div className="table-empty">
                {searchQuery || statusFilter !== "all" ? (
                  <>
                    <h3>No tickets found</h3>
                    <p>No requests match your current search or status filter.</p>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Reset filters
                    </button>
                  </>
                ) : (
                  <>
                    <h3>No support requests yet</h3>
                    <p>You haven't submitted any tickets. Create one if you need assistance.</p>
                    <button
                      className="btn-primary"
                      onClick={() => navigate("/create-ticket")}
                    >
                      Create a request
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : viewMode === "list" ? (
            <div className="ticket-list-table">
              {filteredTickets.map((ticket) => (
                <div
                  className="ticket-row"
                  key={ticket._id || ticket.ticketId}
                  onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                >
                  <span className="row-id">#{ticket.ticketId}</span>

                  <div className="row-main">
                    <div className="row-title">{ticket.subject}</div>
                    <div className="row-desc">{ticket.problem}</div>
                  </div>

                  <div className="row-status">
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="row-date">
                    {formatDate(ticket.createdAt)}
                  </div>

                  <div className="row-action">
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ticket-grid-cards">
              {filteredTickets.map((ticket) => (
                <div
                  className="grid-card"
                  key={ticket._id || ticket.ticketId}
                  onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                >
                  <div>
                    <div className="grid-card-top">
                      <span className="grid-id">#{ticket.ticketId}</span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <h3 className="grid-title">{ticket.subject}</h3>
                    <p className="grid-desc">{ticket.problem}</p>
                  </div>

                  <div className="grid-card-bottom">
                    <span>{formatDate(ticket.createdAt)}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 500, fontSize: "12.5px" }}>
                      View details
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
