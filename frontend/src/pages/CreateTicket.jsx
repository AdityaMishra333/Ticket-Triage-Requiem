import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    subject: "",
    item: "",
    serviceDate: "",
    description: "",
    contactDetails: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [createdTicketId, setCreatedTicketId] = useState("");
  const [copied, setCopied] = useState(false);

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
      setMessage("Please fill in all fields before submitting.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/tickets", cleanFormData);
      const ticketId = response.data.ticket?.ticketId;
      if (!ticketId) {
        setMessage("Ticket created, but could not retrieve ticket ID. Please check your tickets page.");
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

      setMessage(error.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ customerName: "", subject: "", item: "", serviceDate: "", description: "", contactDetails: "" });
    setCreatedTicketId("");
    setMessage("");
  };

  const copyId = () => {
    if (!createdTicketId) return;
    navigator.clipboard.writeText(createdTicketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-bg">
      <Navbar />

      <div className="page-container-narrow">
        <div className="form-panel">
          <div className="form-header-simple">
            <h1>Submit a request</h1>
            <p>Please describe your issue and our team will get back to you.</p>
          </div>

          {createdTicketId ? (
            <div className="success-banner-box">
              <h3>Request received</h3>
              <p>Your ticket has been logged and assigned to the support queue.</p>

              <div>
                <span className="id-pill-large">#{createdTicketId}</span>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(`/tickets/${createdTicketId}`)}
                >
                  View ticket
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={copyId}
                >
                  {copied ? "Copied" : "Copy reference ID"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleReset}
                >
                  Submit another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group-field">
                <label className="field-label" htmlFor="ticket-customer-name">
                  Customer name
                </label>
                <input
                  id="ticket-customer-name"
                  className="field-input"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="ticket-subject">
                  Subject
                </label>
                <input
                  id="ticket-subject"
                  className="field-input"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Cannot access monthly billing invoice"
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="ticket-item">
                  Item
                </label>
                <input
                  id="ticket-item"
                  className="field-input"
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  placeholder="e.g. Annual maintenance plan"
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="ticket-service-date">
                  Service date
                </label>
                <input
                  id="ticket-service-date"
                  className="field-input"
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="ticket-description">
                  Description
                </label>
                <textarea
                  id="ticket-description"
                  className="field-textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide as much detail as possible, including what you were doing when the issue occurred..."
                  required
                />
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="ticket-contact">
                  Your contact email or phone
                </label>
                <input
                  id="ticket-contact"
                  className="field-input"
                  name="contactDetails"
                  value={formData.contactDetails}
                  onChange={handleChange}
                  placeholder="name@company.com or +1 (555) 000-0000"
                  required
                />
              </div>

              {message && (
                <div className="form-feedback error" role="alert" style={{ marginBottom: "16px" }}>
                  <span>{message}</span>
                </div>
              )}

              <div className="form-actions-bar">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit request"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;