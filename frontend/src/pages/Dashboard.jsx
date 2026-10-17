import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            const response = await api.get("/tickets");

            setTickets(response.data.tickets || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "submitted":
                return "status submitted";

            case "assigned":
                return "status assigned";

            case "in_progress":
                return "status progress";

            case "resolved":
                return "status resolved";

            case "closed":
                return "status closed";

            default:
                return "status";
        }
    };

    return (
        <div className="dashboard">

            <header className="dashboard-header">
                <div>
                    <h1>Customer Dashboard</h1>
                    <p>AI Ticket Triage System</p>
                </div>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <div className="dashboard-actions">

                <button
                    className="primary-btn"
                    onClick={() =>
                        navigate("/create-ticket")
                    }
                >
                    + Submit New Ticket
                </button>

                <button
                    className="secondary-btn"
                    onClick={() =>
                        navigate("/track-ticket")
                    }
                >
                    Track Ticket
                </button>

            </div>

            <section className="tickets-section">

                <h2>My Tickets</h2>

                {loading ? (
                    <p className="message">
                        Loading tickets...
                    </p>
                ) : tickets.length === 0 ? (
                    <div className="empty-box">
                        <h3>No tickets yet</h3>

                        <p>
                            Submit your first ticket
                            to get started.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={() =>
                                navigate("/create-ticket")
                            }
                        >
                            Create Ticket
                        </button>
                    </div>
                ) : (
                    <div className="ticket-grid">

                        {tickets.map((ticket) => (

                            <div
                                className="ticket-card"
                                key={ticket._id}
                            >

                                <div className="ticket-card-header">

                                    <h3>
                                        {ticket.subject}
                                    </h3>

                                    <span
                                        className={getStatusClass(
                                            ticket.status
                                        )}
                                    >
                                        {ticket.status}
                                    </span>

                                </div>

                                <p>
                                    <strong>
                                        Ticket ID:
                                    </strong>{" "}
                                    {ticket.ticketId}
                                </p>

                                <p className="description">
                                    {ticket.description}
                                </p>

                                <button
                                    className="view-btn"
                                    onClick={() =>
                                        navigate(
                                            `/tickets/${ticket.ticketId}`
                                        )
                                    }
                                >
                                    View Details →
                                </button>

                            </div>

                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default Dashboard;