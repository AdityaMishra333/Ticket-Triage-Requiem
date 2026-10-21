import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusLabel = (status) => (status || "submitted").replaceAll("_", " ");

function AdminDashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const counts = useMemo(() => ({
    total: adminTickets.length,
    open: adminTickets.filter((ticket) => ["submitted", "assigned"].includes(ticket.status)).length,
    inProgress: adminTickets.filter((ticket) => ticket.status === "in_progress").length,
    resolved: adminTickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status)).length
  }), []);

  const departmentCounts = useMemo(
    () => departments.map((department) => ({
      name: department,
      count: adminTickets.filter((ticket) => ticket.department === department).length
    })).sort((a, b) => b.count - a.count),
    []
  );

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return adminTickets.filter((ticket) => {
      const matchesSearch = !query || [
        ticket.ticketId, ticket.subject, ticket.customerName, ticket.department
      ].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "open" && ["submitted", "assigned"].includes(ticket.status))
        || (statusFilter === "in_progress" && ticket.status === "in_progress")
        || (statusFilter === "resolved" && ["resolved", "closed"].includes(ticket.status));
      const matchesDepartment = departmentFilter === "all" || ticket.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [search, statusFilter, departmentFilter]);

  const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate("/admin")} aria-label="SupportDesk dashboard">
          <span className="admin-brand-mark">S</span>
          <span>supportdesk<span className="admin-brand-period">.</span></span>
        </button>
        <div className="admin-workspace">
          <span className="admin-workspace-icon">A</span>
          <span><strong>Support team</strong><small>Admin</small></span>
          <span className="admin-workspace-chevron">⌄</span>
        </div>
        <p className="admin-nav-label">MENU</p>
        <button className="admin-nav-item active"><span>▦</span> Overview</button>
        <button className="admin-nav-item" onClick={() => { setStatusFilter("all"); setDepartmentFilter("all"); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}><span>▤</span> All tickets <span className="admin-nav-count">{counts.total}</span></button>
        <p className="admin-nav-label admin-nav-label-spaced">TEAMS</p>
        {departments.map((department) => (
          <button
            className={`admin-nav-item ${departmentFilter === department ? "selected" : ""}`}
            key={department}
            onClick={() => { setDepartmentFilter(departmentFilter === department ? "all" : department); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}
          >
            <span className="department-nav-dot" />{department}
          </button>
        ))}
        <div className="admin-sidebar-footer">
          <span className="admin-avatar">AD</span>
          <span><strong>Administrator</strong><small>Support team</small></span>
          <button aria-label="Sign out" title="Sign out" onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}>↗</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">Support team <span>/</span> <strong>Tickets</strong></div>
          <div className="admin-top-actions"><span className="admin-sample-pill"><span /> Sample data</span><span className="admin-top-avatar">AD</span></div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading">
            <div><p className="admin-eyebrow">{today}</p><h1>Tickets</h1><p className="admin-subtitle">Tickets submitted by users.</p></div>
            <button className="admin-export-button" onClick={() => window.print()}><span>↓</span> Print page</button>
          </div>

          <div className="admin-demo-notice" role="note"><span>ⓘ</span><div><strong>Sample tickets</strong><span>This page uses example data. It is not connected to live tickets.</span></div></div>

          <section className="admin-stat-grid" aria-label="Ticket totals">
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Total tickets</span><span className="admin-stat-icon blue">▤</span></div><strong>{counts.total}</strong><small>Submitted by users</small><div className="admin-stat-foot"><span className="stat-trend">↗</span> From all teams</div></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Waiting</span><span className="admin-stat-icon amber">◷</span></div><strong>{counts.open}</strong><small>New or assigned</small><div className="admin-stat-foot"><span className="stat-dot amber-dot" /> Waiting for a reply</div></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>In progress</span><span className="admin-stat-icon violet">↗</span></div><strong>{counts.inProgress}</strong><small>Being handled</small><div className="admin-stat-foot"><span className="stat-dot violet-dot" /> Work has started</div></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Completed</span><span className="admin-stat-icon green">✓</span></div><strong>{counts.resolved}</strong><small>Resolved or closed</small><div className="admin-stat-foot"><span className="stat-dot green-dot" /> Finished tickets</div></article>
          </section>

          <section className="admin-middle-grid">
            <article className="admin-panel department-panel">
              <div className="admin-panel-heading"><div><h2>Tickets by department</h2><p>Tickets assigned to each team</p></div><span className="admin-panel-menu">•••</span></div>
              <div className="department-chart">
                {departmentCounts.map((department, index) => (
                  <button className="department-chart-row" key={department.name} onClick={() => { setDepartmentFilter(departmentFilter === department.name ? "all" : department.name); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}>
                    <span className={`department-chart-icon department-icon-${index + 1}`}>{["IT", "F", "HR", "$", "CS"][departments.indexOf(department.name)]}</span>
                    <span className="department-chart-name">{department.name}</span>
                    <span className="department-bar-wrap"><span style={{ width: `${Math.max(8, department.count / counts.total * 100)}%` }} /></span>
                    <strong>{department.count}</strong>
                  </button>
                ))}
              </div>
              <button className="admin-text-link" onClick={() => { setDepartmentFilter("all"); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}>Show all teams <span>→</span></button>
            </article>

            <article className="admin-panel attention-panel">
              <div className="admin-panel-heading"><div><h2>Waiting for a reply</h2><p>New and assigned tickets</p></div><span className="attention-count">{counts.open}</span></div>
              {adminTickets.filter((ticket) => ["submitted", "assigned"].includes(ticket.status)).slice(0, 3).map((ticket) => (
                <button className="attention-ticket" key={ticket.ticketId} onClick={() => navigate(`/admin/tickets/${ticket.ticketId}`)}>
                  <span className="attention-ticket-icon">{ticket.customerName.split(" ").map((part) => part[0]).join("")}</span>
                  <span className="attention-ticket-info"><strong>{ticket.subject}</strong><small>{ticket.ticketId} <i>·</i> {ticket.department}</small></span>
                  <span className={`priority-dot priority-${ticket.priority.toLowerCase()}`} title={`${ticket.priority} priority`} />
                  <span className="attention-arrow">›</span>
                </button>
              ))}
              <button className="admin-text-link attention-link" onClick={() => { setStatusFilter("open"); document.getElementById("admin-ticket-list")?.scrollIntoView({ behavior: "smooth" }); }}>See all new tickets <span>→</span></button>
            </article>
          </section>

          <section className="admin-panel admin-ticket-panel" id="admin-ticket-list">
            <div className="admin-panel-heading ticket-panel-heading"><div><h2>All tickets <span className="ticket-total-chip">{filteredTickets.length}</span></h2><p>Open a ticket to see its details and updates</p></div><button className="admin-filter-button" onClick={() => { setSearch(""); setStatusFilter("all"); setDepartmentFilter("all"); }}>↻ <span>Clear filters</span></button></div>
            <div className="admin-ticket-controls">
              <div className="admin-status-tabs">
                {[["all", "All tickets"], ["open", "Open"], ["in_progress", "In progress"], ["resolved", "Resolved"]].map(([value, label]) => <button key={value} className={statusFilter === value ? "active" : ""} onClick={() => setStatusFilter(value)}>{label}<span>{value === "all" ? counts.total : value === "open" ? counts.open : value === "in_progress" ? counts.inProgress : counts.resolved}</span></button>)}
              </div>
              <div className="admin-ticket-filters">
                <label className="admin-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or ticket ID" /></label>
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
                    <td className="table-arrow">›</td>
                  </tr>
                ))}</tbody>
              </table>
              {filteredTickets.length === 0 && <div className="admin-no-results">No tickets found. Try changing your filters.</div>}
            </div>
            <div className="admin-table-footer"><span>Showing <strong>{filteredTickets.length}</strong> of <strong>{counts.total}</strong> example tickets</span><span>Example data - October 2026</span></div>
          </section>
          <footer className="admin-page-footer">SupportDesk <span>-</span> Admin</footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
