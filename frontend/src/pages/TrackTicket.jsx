import { useState } from "react";
import api from "../services/api";

function TrackTicket() {

    const [ticketId, setTicketId] = useState("");
    const [ticket, setTicket] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const trackTicket = async (event) => {
        event.preventDefault();
        const requestedId = ticketId.trim();
        setTicket(null);
        setMessage("");
        if (!requestedId) {
            setMessage("Enter a ticket ID to continue.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(
                `/tickets/track/${encodeURIComponent(requestedId)}`
            );

            if (response.data.ticketId?.toLowerCase() !== requestedId.toLowerCase()) {
                setMessage("The returned ticket could not be verified. Check the ID and try again.");
                return;
            }
            setTicket(response.data);

        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || "Unable to find that ticket.");
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="track-ticket-container">

            <h1>Track Your Ticket</h1>

            <form onSubmit={trackTicket}>
                <input
                    type="text"
                    name="ticketId"
                    placeholder="Enter Ticket ID"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    required
                />
                {message && <p className="form-feedback error" role="alert">{message}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Checking..." : "Track Ticket"}
                </button>
            </form>

            {ticket && (

                <div>

                    <h2>{ticket.subject}</h2>

                    <p>
                        Status: {ticket.status}
                    </p>

                    <p>Ticket ID: {ticket.ticketId}</p>

                </div>

            )}

        </div>
    );
}

export default TrackTicket;