import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function TicketDetails() {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTicket = async () => {
            try {
                const response = await api.get(`/tickets/track/${ticketId}`);
                setTicket(response.data);
            } catch (requestError) {
                console.error(requestError);
                setError("Ticket not found.");
            }
        };

        loadTicket();
    }, [ticketId]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!ticket) {
        return <p>Loading ticket...</p>;
    }

    return (
        <div>
            <h1>{ticket.subject}</h1>
            <p>Ticket ID: {ticket.ticketId}</p>
            <p>Status: {ticket.status}</p>
            <p>{ticket.description}</p>

            <h2>Ticket Timeline</h2>
            {ticket.statusHistory.map((event, index) => (
                <div key={`${event.status}-${event.timestamp}-${index}`}>
                    <h3>{event.status}</h3>
                    <p>{new Date(event.timestamp).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
}

export default TicketDetails;
