import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadTickets() {
      try {
        const response = await api.get("/tickets");
        if (!Array.isArray(response.data.tickets)) {
          throw new Error("The ticket list could not be loaded.");
        }
        if (!ignore) {
          setTickets(response.data.tickets);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Error fetching admin tickets:", error);
        if (!ignore) {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          } else if (error.response?.status === 403) {
            setErrorMessage("You are not authorized to view the admin dashboard.");
          } else {
            setErrorMessage(
              error.response?.data?.message ||
                error.message ||
                "Unable to load tickets. Please try again."
            );
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTickets();
    return () => {
      ignore = true;
    };
  }, [navigate]);

  const departmentStats = useMemo(() => {
    const counts = new Map();

    tickets.forEach((ticket) => {
      const department = ticket.suggestedTeam || ticket.category || "";
      if (department.trim()) {
        counts.set(department, (counts.get(department) || 0) + 1);
      }
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [tickets]);

  const assignedCount = useMemo(
    () => tickets.filter((ticket) => Boolean(ticket.suggestedTeam || ticket.category)).length,
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tickets;

    return tickets.filter((ticket) =>
      [
        ticket.ticketId,
        ticket.subject,
        ticket.suggestedTeam,
        ticket.category,
        ticket.status
      ].some((value) => (value || "").toLowerCase().includes(query))
    );
  }, [tickets, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getDepartment = (ticket) =>
    ticket.suggestedTeam || ticket.category || "Awaiting AI assignment";

  const getStatusBadge = (status) => {
    const normalized = (status || "submitted").toLowerCase();
    return (
      <span className={`status-badge ${normalized}`}>
        <span className="dot"></span>
        {normalized.replaceAll("_", " ")}
      </span>
    );
  };

  return (
    <div className="admin-dashboard">
      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-header-row">
          <div>
            <span className="admin-eyebrow">ADMINISTRATION</span>
            <h1>Support overview</h1>
            <p>Monitor submitted tickets and their AI-suggested departments.</p>
          </div>
        </div>

        <section className="metrics-ribbon admin-metrics" aria-label="Ticket summary">
          <div className="metric-item">
            <span className="metric-num">{loading ? "—" : tickets.length}</span>
            <span className="metric-label">Total tickets submitted</span>
          </div>
          <div className="metric-item">
            <span className="metric-num">{loading ? "—" : assignedCount}</span>
            <span className="metric-label">AI department assigned</span>
          </div>
          <div className="metric-item">
            <span className="metric-num">{loading ? "—" : tickets.length - assignedCount}</span>
            <span className="metric-label">Awaiting AI assignment</span>
          </div>
        </section>

        <section className="admin-departments">
          <div className="admin-section-heading">
            <div>
              <h2>Tickets by department</h2>
              <p>Based on the AI-suggested team or ticket category.</p>
            </div>
          </div>
          {loading ? (
            <div className="admin-department-empty">Loading department totals…</div>
          ) : departmentStats.length === 0 ? (
            <div className="admin-department-empty">
              No AI department assignments are available yet.
            </div>
          ) : (
            <div className="admin-department-grid">
              {departmentStats.map(([department, count]) => (
                <article className="admin-department-card" key={department}>
                  <span className="admin-department-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18" />
                      <path d="M5 21V7l8-4v18" />
                      <path d="M19 21V11l-6-4" />
                      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01M5 10v.01M5 13v.01M5 16v.01" />
                    </svg>
                  </span>
                  <span className="admin-department-name">{department}</span>
                  <strong>{count}</strong>
                  <span className="admin-department-label">
                    {count === 1 ? "ticket" : "tickets"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-ticket-section">
          <div className="admin-section-heading admin-ticket-heading">
            <div>
              <h2>All submitted tickets</h2>
              <p>Review ticket status and AI department assignment.</p>
            </div>
            <label className="admin-search">
              <span className="sr-only">Search tickets</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tickets..."
                type="search"
              />
            </label>
          </div>

          {errorMessage ? (
            <div className="admin-ticket-empty" role="alert">{errorMessage}</div>
          ) : loading ? (
            <div className="admin-ticket-empty" aria-live="polite">Loading tickets…</div>
          ) : filteredTickets.length === 0 ? (
            <div className="admin-ticket-empty">
              {tickets.length === 0
                ? "No tickets have been submitted yet."
                : "No tickets match your search."}
            </div>
          ) : (
            <div className="admin-ticket-table-wrap">
              <table className="admin-ticket-table">
                <thead>
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Department</th>
                    <th scope="col">Status</th>
                    <th scope="col">Submitted</th>
                    <th scope="col"><span className="sr-only">Open ticket</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id || ticket.ticketId}
                      onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          navigate(`/tickets/${ticket.ticketId}`);
                        }
                      }}
                      tabIndex={0}
                      className="admin-ticket-row"
                    >
                      <td>
                        <span className="admin-ticket-id">#{ticket.ticketId}</span>
                        <span className="admin-ticket-subject">{ticket.subject || "Untitled ticket"}</span>
                      </td>
                      <td>
                        <span className={`admin-department-tag${getDepartment(ticket) === "Awaiting AI assignment" ? " is-unassigned" : ""}`}>
                          {getDepartment(ticket)}
                        </span>
                      </td>
                      <td>{getStatusBadge(ticket.status)}</td>
                      <td className="admin-ticket-date">{formatDate(ticket.createdAt)}</td>
                      <td className="admin-ticket-arrow" aria-hidden="true">›</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
