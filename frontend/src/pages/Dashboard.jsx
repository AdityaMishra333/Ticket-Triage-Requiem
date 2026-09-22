import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/login");
    };

    return (
        <div>

            <h1>Customer Dashboard</h1>

            <button onClick={() => navigate("/create-ticket")}>
                Create New Ticket
            </button>

            <button onClick={() => navigate("/track-ticket")}>
                Track Ticket
            </button>

            <button onClick={logout}>
                Logout
            </button>

        </div>
    );
}

export default Dashboard;