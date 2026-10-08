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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await api.post(
                "/tickets",
                formData
            );

            alert(
                `Ticket created successfully!\nTicket ID: ${response.data.ticket.ticketId}`
            );

            navigate("/dashboard");

        } catch (error) {
            console.error("Create Ticket Error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            alert(
                error.response?.data?.message ||
                "Failed to create ticket."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
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
            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Ticket"}
            </button>
        </form>
    );
}

export default CreateTicket;