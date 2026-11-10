import { useNavigate } from "react-router-dom";
import { isAdminToken } from "../utils/auth";

function NotFound() {
  const navigate = useNavigate();
  const homePath = isAdminToken(localStorage.getItem("token")) ? "/admin" : "/dashboard";

  return (
    <div className="dashboard-bg not-found-page">
      <div className="content-panel not-found-panel">
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <button type="button" className="btn-primary" onClick={() => navigate(homePath)}>
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;
