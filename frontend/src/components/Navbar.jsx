import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read stored user details if available
  let username = "My Account";
  let initials = "ME";
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      username = user.name || user.email?.split("@")[0] || "My Account";
      initials = (username.slice(0, 2) || "ME").toUpperCase();
    }
  } catch {
    // fallback
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path === "/create-ticket" && location.pathname === "/create-ticket") return true;
    if (path === "/track-ticket" && location.pathname === "/track-ticket") return true;
    return false;
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div
          className="navbar-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="brand-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <span className="brand-title">SupportDesk</span>
        </div>

        {/* Center navigation */}
        <nav className="navbar-nav">
          <button
            type="button"
            className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            <span>Tickets</span>
          </button>

          <button
            type="button"
            className={`nav-link ${isActive("/create-ticket") ? "active" : ""}`}
            onClick={() => navigate("/create-ticket")}
          >
            <span>New Request</span>
          </button>

          <button
            type="button"
            className={`nav-link ${isActive("/track-ticket") ? "active" : ""}`}
            onClick={() => navigate("/track-ticket")}
          >
            <span>Track</span>
          </button>
        </nav>

        {/* User & Sign out */}
        <div className="navbar-user">
          <div className="user-badge" title={username}>
            <div className="user-avatar-circle">{initials}</div>
            <span className="user-name-text">{username}</span>
          </div>

          <button
            type="button"
            className="btn-signout-subtle"
            onClick={handleLogout}
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
