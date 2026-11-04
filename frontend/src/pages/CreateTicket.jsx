import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import FieldError from "../components/FieldError";
import { LIMITS, MIN_SERVICE_DATE, ticketValidators, todayLocal } from "../utils/validation";
import { useFieldErrors } from "../utils/useFieldErrors";

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: "",
    subject: "",
    item: "",
    serviceDate: "",
    problem: "",
    yourEmail: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [createdTicketId, setCreatedTicketId] = useState("");
  const [copied, setCopied] = useState(false);
  const { errors, recheckField, checkAll, fieldProps } = useFieldErrors(ticketValidators);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    recheckField(e.target.name, { ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setCreatedTicketId("");

    if (!checkAll(formData)) return;

    const cleanFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value.trim()])
    );

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

  const copyId = () => {
    if (!createdTicketId) return;
    navigator.clipboard.writeText(createdTicketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-bg">
      <Navbar />

      <main className="ticket-page">
        <div className="form-panel">
          <div className="form-header-simple">
            <h1>Submit Request</h1>
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
              </div>
            </div>
          ) : (
            <form className="ticket-form" onSubmit={handleSubmit} noValidate>
              <div className="ticket-form-grid">
                <div className="form-group-field">
                  <label className="field-label" htmlFor="ticket-customer-name">
                    Customer Name
                  </label>
                  <input
                    id="ticket-customer-name"
                    className="field-input"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={LIMITS.name.max}
                    required
                    {...fieldProps("customerName", formData)}
                  />
                  <FieldError name="customerName" message={errors.customerName} />
                </div>
                <div className="form-group-field">
                  <label className="field-label" htmlFor="ticket-contact">
                    Your Contact Email
                  </label>
                  <input
                    id="ticket-contact"
                    className="field-input"
                    type="email"
                    name="yourEmail"
                    autoComplete="email"
                    maxLength={LIMITS.email.max}
                    value={formData.yourEmail}
                    onChange={handleChange}
                    required
                    {...fieldProps("yourEmail", formData)}
                  />
                  <FieldError name="yourEmail" message={errors.yourEmail} />
                </div>
                <div className="form-group-field field-span-2">
                  <label className="field-label" htmlFor="ticket-subject">
                    Subject
                  </label>
                  <input
                    id="ticket-subject"
                    className="field-input"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={LIMITS.subject.max}
                    required
                    {...fieldProps("subject", formData)}
                  />
                  <FieldError name="subject" message={errors.subject} />
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
                    maxLength={LIMITS.item.max}
                    required
                    {...fieldProps("item", formData)}
                  />
                  <FieldError name="item" message={errors.item} />
                </div>
                <div className="form-group-field">
                  <label className="field-label" htmlFor="ticket-service-date">
                    Service Date
                  </label>
                  <input
                    id="ticket-service-date"
                    className="field-input"
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleChange}
                    min={MIN_SERVICE_DATE}
                    max={todayLocal()}
                    required
                    {...fieldProps("serviceDate", formData)}
                  />
                  <FieldError name="serviceDate" message={errors.serviceDate} />
                </div>
              </div>

              <div className="form-group-field field-grow">
                <label className="field-label" htmlFor="ticket-description">
                  Description
                </label>
                <textarea
                  id="ticket-description"
                  className="field-textarea"
                  name="problem"
                  value={formData.problem}
                  onChange={handleChange}
                  required
                  {...fieldProps("problem", formData)}
                />
                <FieldError name="problem" message={errors.problem} />
              </div>

              {message && (
                <div className="form-feedback error" role="alert">
                  <span>{message}</span>
                </div>
              )}

              <div className="form-actions-bar">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
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

        <aside className="ticket-aside">
          <h2>What happens next</h2>
          <ol className="ticket-steps">
            <li><strong>Received</strong>Your request is logged and sent to the right department.</li>
            <li><strong>Approval</strong>Our team checks the suggested reply before it goes out.</li>
            <li><strong>Working</strong>Our team handles your request and revises the reply if needed.</li>
            <li><strong>Resolved</strong>The approved reply is sent to your contact email.</li>
          </ol>
        </aside>
      </main>
    </div>
  );
}

export default CreateTicket;