import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import AdminDashboard from "./AdminDashboard";

function UserDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"

  useEffect(() => {
    let ignore = false;
    const loadTickets = async () => {
      try {
        const response = await api.get("/tickets");
        if (!ignore) {
          setTickets(response.data.tickets || []);
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

  // Compute stats
  const stats = useMemo(() => {
    const total = tickets.length;
    const submitted = tickets.filter((t) => t.status === "submitted").length;
    const inProgress = tickets.filter(
      (t) => t.status === "in_progress" || t.status === "assigned"
    ).length;
    const resolved = tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed"
    ).length;

    return { total, submitted, inProgress, resolved };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (ticket.subject || "").toLowerCase().includes(q) ||
        (ticket.ticketId || "").toLowerCase().includes(q) ||
        (ticket.description || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "in_progress") {
        return ticket.status === "in_progress" || ticket.status === "assigned";
      }
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
    let display = norm.replace("_", " ");
    return (
      <span className={`status-badge ${norm}`}>
        <span className="dot"></span>
        {display || "Submitted"}
      </span>
    );
  };

  return (
    <div>
      <Navbar />

      <main className="dashboard-page">
        {/* Header */}
        <div className="dashboard-header-row">
          <div>
            <h1>AI Ticket Triage</h1>
            <p>Track, view, and manage your reported requests.</p>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/create-ticket")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Request
          </button>
        </div>

        {/* Subtle metrics ribbon */}
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
            <span className="metric-label">In progress</span>
          </div>
          <div className="metric-item">
            <span className="metric-num">{stats.resolved}</span>
            <span className="metric-label">Resolved</span>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <section className="dashboard-toolbar">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All <span className="tab-count">{tickets.length}</span>
            </button>
            <button
              className={`tab-btn ${statusFilter === "submitted" ? "active" : ""}`}
              onClick={() => setStatusFilter("submitted")}
            >
              Open <span className="tab-count">{stats.submitted}</span>
            </button>
            <button
              className={`tab-btn ${statusFilter === "in_progress" ? "active" : ""}`}
              onClick={() => setStatusFilter("in_progress")}
            >
              In Progress <span className="tab-count">{stats.inProgress}</span>
            </button>
            <button
              className={`tab-btn ${statusFilter === "resolved" ? "active" : ""}`}
              onClick={() => setStatusFilter("resolved")}
            >
              Resolved <span className="tab-count">{stats.resolved}</span>
            </button>
          </div>

          <div className="toolbar-controls">
            <div className="search-input-wrapper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input-field"
                type="text"
                placeholder="Filter by title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Card view"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Tickets Content */}
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
                    <div className="row-desc">{ticket.description}</div>
                  </div>

                  <div className="row-status">
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="row-date">
                    {formatDate(ticket.createdAt)}
                  </div>

                  <div className="row-action">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
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
                    <p className="grid-desc">{ticket.description}</p>
                  </div>

                  <div className="grid-card-bottom">
                    <span>{formatDate(ticket.createdAt)}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 500, fontSize: "12.5px" }}>
                      View details →
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

function getStoredRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role || "";
  } catch {
    return "";
  }
}

function Dashboard() {
  if (getStoredRole() === "agent") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default Dashboard;