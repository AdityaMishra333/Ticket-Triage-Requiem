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

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/tickets",
                formData
            );

            console.log(response.data);

            alert("Ticket created successfully!");

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

            alert("Unable to create ticket");

        }
    };

    return (

        <div>

            <h1>Submit a Ticket</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="subject"
                    placeholder="Ticket Subject"
                    value={formData.subject}
                    onChange={handleChange}
                />

                <textarea
                    name="description"
                    placeholder="Describe your problem"
                    value={formData.description}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="contactDetails"
                    placeholder="Contact details"
                    value={formData.contactDetails}
                    onChange={handleChange}
                />

                <button type="submit">
                    Submit Ticket
                </button>

            </form>

        </div>
    );
}

export default CreateTicket;