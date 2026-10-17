import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateTicket() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        contactDetails: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [createdTicketId, setCreatedTicketId] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setCreatedTicketId("");

        const cleanFormData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value.trim()])
        );
        const missingField = Object.values(cleanFormData).some((value) => !value);
        if (missingField) {
            setMessage("Complete all fields before submitting.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/tickets",
                cleanFormData
            );

            const ticketId = response.data.ticket?.ticketId;
            if (!ticketId) {
                setMessage("Ticket creation could not be verified. Please check your dashboard.");
                return;
            }
            setCreatedTicketId(ticketId);

        } catch (error) {
            console.error("Create Ticket Error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            setMessage(error.response?.data?.message || "Failed to create ticket.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-ticket-container">
            <h1>Complaint Enquiry</h1>
            <h4>Please describe your problem related to our service</h4>
            <form onSubmit={handleSubmit}>
            <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
            />
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                required
            />
            <input
                name="contactDetails"
                value={formData.contactDetails}
                onChange={handleChange}
                placeholder="Contact details"
                required
            />
            {message && <p className="form-feedback error" role="alert">{message}</p>}
            {createdTicketId && (
                <p className="form-feedback success" role="status">
                    Ticket created and confirmed. Ticket ID: {createdTicketId}
                </p>
            )}
            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Ticket"}
            </button>
            {createdTicketId && (
                <button type="button" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                </button>
            )}
        </form>
        </div>
    );
}

export default CreateTicket;