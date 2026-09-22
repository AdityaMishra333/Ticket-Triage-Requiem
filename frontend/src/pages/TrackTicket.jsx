import { useState } from "react";
import api from "../services/api";

function TrackTicket() {

    const [ticketId, setTicketId] = useState("");
    const [ticket, setTicket] = useState(null);

    const trackTicket = async () => {

        try {

            const response = await api.get(
                `/tickets/track/${ticketId}`
            );

            setTicket(response.data);

        } catch (error) {

            console.error(error);

            alert("Ticket not found");

        }
    };

    return (

        <div>

            <h1>Track Your Ticket</h1>

            <input
                type="text"
                placeholder="Enter Ticket ID"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
            />

            <button onClick={trackTicket}>
                Track Ticket
            </button>

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