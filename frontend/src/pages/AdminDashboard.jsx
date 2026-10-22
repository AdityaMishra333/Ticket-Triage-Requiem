import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { normalizeTicket } from "../utils/normalizeTicket";
import "../Admin.css";

// ADMIN ONLY page (route: /admin). Shows every ticket submitted by users,
// fetched from the backend (GET /tickets/admin/all, admin token required).

// Teams shown in the sidebar, chart and filter
const departments = ["IT", "Facilities", "HR", "Finance", "Customer Support"];

// "in_progress" -> "in progress" for display
const statusLabel = (status) => (status || "submitted").replaceAll("_", " ");

function AdminDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")

  // Date shown above the page title
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  // Table filters: free-text search, status tab (all/open/in_progress/resolved) and department
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

    useEffect(() => {
      let ignore = false;
      const loadTickets = async () => {
        try {
          const response = await api.get("/tickets/admin/all");
          if (!ignore) {
            setTickets((response.data.tickets || []).map(normalizeTicket));
          }
        } catch (error) {
          console.error("Error fetching tickets:", error);
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          } else if (!ignore) {
            setError("Could not load tickets. Please try again.");
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

  // Numbers for the four stat cards and the status tabs.
  // "Open" = submitted + assigned, "Resolved" = resolved + closed.
  const counts = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ["submitted", "assigned"].includes(ticket.status)).length,
    inProgress: tickets.filter((ticket) => ticket.status === "in_progress").length,
    resolved: tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status)).length
  }), [tickets]);

  // Ticket count per department for the "Tickets by department" bar chart, biggest first
  const departmentCounts = useMemo(
    () => departments.map((department) => ({
      name: department,
      count: tickets.filter((ticket) => ticket.department === department).length
    })).sort((a, b) => b.count - a.count),
    [tickets]
  );

  // Tickets shown in the main table: search + status tab + department filter combined
  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch = !query || [
        ticket.ticketId, ticket.subject, ticket.customerName, ticket.department
      ].some((value) => (value || "").toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "open" && ["submitted", "assigned"].includes(ticket.status))
        || (statusFilter === "in_progress" && ticket.status === "in_progress")
        || (statusFilter === "resolved" && ["resolved", "closed"].includes(ticket.status));
      const matchesDepartment = departmentFilter === "all" || ticket.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [tickets, search, statusFilter, departmentFilter]);

  const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });

  return (
    <div className="admin-shell">
      {/* Left sidebar: brand, menu, team (department) shortcuts and sign out */}
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate("/admin")} aria-label="Los Polos Hermanos dashboard">
          <span className="admin-brand-mark">L</span>
          <span>Los Polos Hermanos<span className="admin-brand-period">.</span></span>
        </button>
        <div className="admin-workspace">
          <span className="admin-workspace-icon">A</span>
          <span><strong>Support team</strong><small>Admin Dashboard</small></span>
          
        </div>
        <p className="admin-nav-label">MENU</p>
        {/* "All tickets" clears the filters and scrolls to the table */}
        <button className="admin-nav-item active">Overview</button>
        <button className="admin-nav-item" onClick={() => { setStatusFilter("all"); setDepartmentFilter("all"); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}>All tickets <span className="admin-nav-count">{counts.total}</span></button>
        <p className="admin-nav-label admin-nav-label-spaced">TEAMS</p>
        {/* One button per department; click to filter the table, click again to clear */}
        {departments.map((department) => (
          <button
            className={`admin-nav-item ${departmentFilter === department ? "selected" : ""}`}
            key={department}
            onClick={() => { setDepartmentFilter(departmentFilter === department ? "all" : department); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}
          >
            {department}
          </button>
        ))}
        {/* Sign out: clears the saved session and returns to the login page */}
        <div className="admin-sidebar-footer">
          <span className="admin-avatar">AD</span>
          <span><strong>Administrator</strong><small>Support team</small></span>
          
        </div>
      </aside>

      {/* Main area */}
      <main className="admin-main">
        {/* Top bar with breadcrumb */}
        <header className="admin-topbar">
          <div className="admin-breadcrumb">Every ticket submitted by users, newest first</div>
          <div className="admin-top-actions"><span className="admin-top-avatar">AD</span>
            {/* Sign out: same behaviour as the user dashboard (clear session, go to login) */}
            <button type="button" className="admin-signout-button" title="Sign out" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>Sign out</button>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div><p className="admin-eyebrow">{today}</p><h1>Tickets</h1><p className="admin-subtitle">Tickets submitted by users.</p></div>          </div>

          {/* Loading / error message while the tickets are fetched */}
          {loading && <div className="admin-demo-notice" role="status"><div><strong>Loading tickets…</strong></div></div>}
          {error && <div className="admin-demo-notice" role="alert"><div><strong>{error}</strong></div></div>}

          {/* Four stat cards: total, waiting, in progress, completed */}
          <section className="admin-stat-grid" aria-label="Ticket totals">
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Total tickets</span></div><strong>{counts.total}</strong><small>Submitted by users</small><div className="admin-stat-foot">From all teams</div></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Waiting</span></div><strong>{counts.open}</strong><small>New or assigned</small><div className="admin-stat-foot"><span className="stat-dot amber-dot" /> Waiting for a reply</div></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>In progress</span></div><strong>{counts.inProgress}</strong><small>Being handled</small><div className="admin-stat-foot"><span className="stat-dot violet-dot" /> Work has started</div></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Completed</span></div><strong>{counts.resolved}</strong><small>Resolved or closed</small><div className="admin-stat-foot"><span className="stat-dot green-dot" /> Finished tickets</div></article>
          </section>

          {/* Middle row: department chart (left) and newest waiting tickets (right) */}
          <section className="admin-middle-grid">
            {/* Department chart: click a bar to filter the table by that department */}
            <article className="admin-panel department-panel">
              <div className="admin-panel-heading"><div><h2>Tickets by department</h2><p>Tickets assigned to each team</p></div></div>
              <div className="department-chart">
                {departmentCounts.map((department) => (
                  <button className="department-chart-row" key={department.name} onClick={() => { setDepartmentFilter(departmentFilter === department.name ? "all" : department.name); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}>
                    <span className="department-chart-name">{department.name}</span>
                    <strong>{department.count}</strong>
                  </button>
                ))}
              </div>
              <button className="admin-text-link" onClick={() => { setDepartmentFilter("all"); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}>Show all teams</button>
            </article>

            {/* "Waiting for a reply": first 3 submitted/assigned tickets; click one to open its details page */}
            <article className="admin-panel attention-panel">
              <div className="admin-panel-heading"><div><h2>Waiting for a reply</h2><p>New and assigned tickets</p></div><span className="attention-count">{counts.open}</span></div>
              {tickets.filter((ticket) => ["submitted", "assigned"].includes(ticket.status)).slice(0, 3).map((ticket) => (
                <button className="attention-ticket" key={ticket.ticketId} onClick={() => navigate(`/admin/tickets/${ticket.ticketId}`)}>
                  <span className="attention-ticket-icon">{ticket.customerName.split(" ").map((part) => part[0]).join("")}</span>
                  <span className="attention-ticket-info"><strong>{ticket.subject}</strong><small>{ticket.ticketId} <i>·</i> {ticket.department}</small></span>
                  <span className={`priority-dot priority-${ticket.priority.toLowerCase()}`} title={`${ticket.priority} priority`} />
                  
                </button>
              ))}
              <button className="admin-text-link attention-link" onClick={() => { setStatusFilter("open"); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}>See all new tickets</button>
            </article>
          </section>

          {/* Main ticket table with status tabs, search and department filter. Clicking a row opens the ticket details page. */}
          <section className="admin-panel admin-ticket-panel" id="admin-ticket-list">
            <div className="admin-panel-heading ticket-panel-heading"><div><h2>All tickets <span className="ticket-total-chip">{filteredTickets.length}</span></h2><p>Open a ticket to see its details and updates</p></div><button className="admin-filter-button" onClick={() => { setSearch(""); setStatusFilter("all"); setDepartmentFilter("all"); }}><span>Clear filters</span></button></div>
            <div className="admin-ticket-controls">
              <div className="admin-status-tabs">
                {[["all", "All tickets"], ["open", "Open"], ["in_progress", "In progress"], ["resolved", "Resolved"]].map(([value, label]) => <button key={value} className={statusFilter === value ? "active" : ""} onClick={() => setStatusFilter(value)}>{label}<span>{value === "all" ? counts.total : value === "open" ? counts.open : value === "in_progress" ? counts.inProgress : counts.resolved}</span></button>)}
              </div>
              <div className="admin-ticket-filters">
                <label className="admin-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or ticket ID" /></label>
                <select aria-label="Filter by department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}><option value="all">All departments</option>{departments.map((department) => <option key={department}>{department}</option>)}</select>
              </div>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-ticket-table">
                <thead><tr><th>REQUEST</th><th>REQUESTER</th><th>DEPARTMENT</th><th>PRIORITY</th><th>STATUS</th><th>SUBMITTED</th><th /></tr></thead>
                <tbody>{filteredTickets.map((ticket) => (
                  <tr key={ticket.ticketId} onClick={() => navigate(`/admin/tickets/${ticket.ticketId}`)}>
                    <td><strong>{ticket.subject}</strong><small>{ticket.ticketId}</small></td>
                    <td><span className="requester-cell"><span>{ticket.customerName.split(" ").map((part) => part[0]).join("")}</span>{ticket.customerName}</span></td>
                    <td><span className="department-cell"><i />{ticket.department}</span></td>
                    <td><span className={`priority-label priority-text-${ticket.priority.toLowerCase()}`}><i className={`priority-dot priority-${ticket.priority.toLowerCase()}`} />{ticket.priority}</span></td>
                    <td><span className={`admin-status admin-status-${ticket.status}`}><i />{statusLabel(ticket.status)}</span></td>
                    <td className="submitted-cell">{formatDate(ticket.createdAt)}</td>
                    <td className="table-arrow" />
                  </tr>
                ))}</tbody>
              </table>
              {filteredTickets.length === 0 && <div className="admin-no-results">No tickets found. Try changing your filters.</div>}
            </div>
            <div className="admin-table-footer"><span>Showing <strong>{filteredTickets.length}</strong> of <strong>{counts.total}</strong> tickets</span></div>
          </section>
          <footer className="admin-page-footer">Los Polos Hermanos <span>-</span> Admin</footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
