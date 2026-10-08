import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function TicketDetails() {
    const { ticketId } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTicket = async () => {
        try {
            const response = await api.get(
                `/tickets/${ticketId}`
            );

            setTicket(response.data);

        } catch (error) {
            console.error("Error fetching ticket:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                alert(
                    error.response?.data?.message ||
                    "Unable to load ticket"
                );
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    if (loading) {
        return <p>Loading ticket...</p>;
    }

    if (!ticket) {
        return <p>Ticket not found.</p>;
    }

    return (
        <div>
            <h1>Ticket Details</h1>

            <p>
                <strong>Ticket ID:</strong>{" "}
                {ticket.ticketId}
            </p>

            <p>
                <strong>Subject:</strong>{" "}
                {ticket.subject}
            </p>

            <p>
                <strong>Description:</strong>{" "}
                {ticket.description}
            </p>

            <p>
                <strong>Contact Details:</strong>{" "}
                {ticket.contactDetails}
            </p>

            <p>
                <strong>Current Status:</strong>{" "}
                {ticket.status}
            </p>

            <hr />

            <h2>Status Timeline</h2>

            {ticket.statusHistory &&
            ticket.statusHistory.length > 0 ? (
                <div>
                    {ticket.statusHistory.map(
                        (history, index) => (
                            <div
                                key={index}
                                style={{
                                    borderLeft:
                                        "3px solid #333",
                                    paddingLeft: "15px",
                                    marginBottom: "20px"
                                }}
                            >
                                <h3>
                                    {history.status}
                                </h3>

                                <p>
                                    <strong>
                                        Actor:
                                    </strong>{" "}
                                    {history.actor}
                                </p>

                                {history.updatedAt && (
                                    <p>
                                        <strong>
                                            Date:
                                        </strong>{" "}
                                        {new Date(
                                            history.updatedAt
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )
                    )}
                </div>
            ) : (
                <p>No status history available.</p>
            )}

            <button
                onClick={() =>
                    navigate("/dashboard")
                }
            >
                Back to Dashboard
            </button>
        </div>
    );
}

export default TicketDetails;