// Validation rules shared by every form. Each validator receives the raw field value
// (and all form values, for cross-field rules) and returns an error message, or "" if valid.

export const LIMITS = {
  name: { min: 2, max: 60 },
  email: { max: 254 },
  password: { min: 6, maxBytes: 72 }, // bcrypt ignores everything after 72 bytes
  subject: { min: 3, max: 120 },
  item: { min: 2, max: 100 },
  problem: { min: 10, max: 2000 },
  ticketId: { max: 40 },
  search: { max: 100 }
};

export const MIN_SERVICE_DATE = "2000-01-01";

// Today's date as YYYY-MM-DD in the user's timezone (toISOString would give the UTC date)
export const todayLocal = () => {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Allowed values for the admin ticket editor, as [value, label].
// Includes the statuses written by the n8n workflows (classified, resolving).
export const DEPARTMENT_OPTIONS = ["IT", "Facilities", "HR", "Finance", "Customer Support", "Unassigned"]
  .map((value) => [value, value]);
export const CATEGORY_OPTIONS = [["billing", "Billing"], ["technical", "Technical"], ["account", "Account"], ["delivery", "Delivery"], ["other", "Other"], ["general", "General"]];
export const STATUS_OPTIONS = [["new", "Received"], ["classified", "Classified"], ["submitted", "Submitted"], ["awaiting_approval", "Approval"], ["assigned", "Assigned"], ["in_progress", "Working"], ["resolving", "Resolving"], ["resolved", "Resolved"], ["closed", "Closed"]];
// The short list admins choose from. STATUS_OPTIONS stays complete because n8n still writes the others.
export const EDITABLE_STATUS_OPTIONS = [["new", "Received"], ["awaiting_approval", "Approval"], ["in_progress", "Working"], ["resolved", "Resolved"]];
// The name shown on screen. Stored values (new, awaiting_approval, ...) stay as the backend and n8n use them.
export const statusLabel = (status) => {
  const key = (status || "new").toLowerCase();
  return EDITABLE_STATUS_OPTIONS.find(([value]) => value === key)?.[1] ?? key.replaceAll("_", " ");
};
export const PRIORITY_OPTIONS = [["low", "Low"], ["medium", "Medium"], ["high", "High"]];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export const validateEmail = (value) => {
  const email = clean(value);
  if (!email) return "Email is required.";
  if (email.length > LIMITS.email.max) return `Email must be at most ${LIMITS.email.max} characters.`;
  // local@domain.tld, with no empty dot-separated parts and a TLD of at least 2 characters
  if (!/^[^\s@.]+(\.[^\s@.]+)*@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(email)) {
    return "Enter a valid email address.";
  }
  return "";
};

export const validateName = (value, label = "Name") => {
  const name = clean(value);
  if (!name) return `${label} is required.`;
  if (name.length < LIMITS.name.min) return `${label} must be at least ${LIMITS.name.min} characters.`;
  if (name.length > LIMITS.name.max) return `${label} must be at most ${LIMITS.name.max} characters.`;
  // \p{M} keeps names in scripts that use combining marks (e.g. Devanagari) valid
  if (!/^\p{L}[\p{L}\p{M}\s.'’-]*$/u.test(name)) {
    return `${label} can only contain letters, spaces, and . ' -`;
  }
  return "";
};

const validateText = (label, { min, max }) => (value) => {
  const text = clean(value);
  if (!text) return `${label} is required.`;
  if (text.length < min) return `${label} must be at least ${min} characters.`;
  if (text.length > max) return `${label} must be at most ${max} characters.`;
  if (!/[\p{L}\p{N}]/u.test(text)) return `${label} must include letters or numbers.`;
  return "";
};

export const validateServiceDate = (value) => {
  const date = clean(value);
  if (!date) return "Enter a complete service date.";
  const parsed = new Date(`${date}T00:00:00`);
  // The round trip rejects impossible dates such as 2026-02-30
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime())
    || parsed.getDate() !== Number(date.slice(8))) {
    return "Enter a valid service date.";
  }
  if (date > todayLocal()) return "Service date cannot be in the future.";
  if (date < MIN_SERVICE_DATE) return "Service date cannot be before the year 2000.";
  return "";
};

// Backend IDs look like TKT-MABC123XY. A leading "#" is allowed because the UI displays IDs that way.
export const normalizeTicketId = (value) => clean(value).replace(/^#/, "").toUpperCase();

export const validateTicketId = (value) => {
  const id = normalizeTicketId(value);
  if (!id) return "Please enter a ticket reference ID.";
  if (id.length > LIMITS.ticketId.max || !/^TKT-[A-Z0-9]+(-[A-Z0-9]+)*$/.test(id)) {
    return "Enter a valid ticket ID, e.g. TKT-MABC123XY.";
  }
  return "";
};

// Sign-in only checks the basics, so that it never locks out an existing account
const validateLoginPassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < LIMITS.password.min) return `Password must be at least ${LIMITS.password.min} characters.`;
  return "";
};

const validateNewPassword = (value) => {
  const basicError = validateLoginPassword(value);
  if (basicError) return basicError;
  if (!value.trim()) return "Password cannot be only spaces.";
  if (new TextEncoder().encode(value).length > LIMITS.password.maxBytes) {
    return `Password must be at most ${LIMITS.password.maxBytes} characters.`;
  }
  return "";
};

const oneOf = (options, label) => (value) =>
  options.some(([allowed]) => allowed === value) ? "" : `Select a valid ${label}.`;

export const loginValidators = {
  email: validateEmail,
  password: validateLoginPassword
};

export const registerValidators = {
  name: (value) => validateName(value),
  email: validateEmail,
  password: validateNewPassword,
  confirmPassword: (value, values) => {
    if (!value) return "Please confirm your password.";
    return value === values.password ? "" : "Passwords do not match.";
  }
};

export const ticketValidators = {
  customerName: (value) => validateName(value, "Customer name"),
  subject: validateText("Subject", LIMITS.subject),
  item: validateText("Item", LIMITS.item),
  serviceDate: validateServiceDate,
  problem: validateText("Description", LIMITS.problem),
  yourEmail: validateEmail
};

export const trackTicketValidators = { ticketId: validateTicketId };

export const adminTicketValidators = {
  department: oneOf(DEPARTMENT_OPTIONS, "department"),
  category: oneOf(CATEGORY_OPTIONS, "category"),
  status: oneOf(STATUS_OPTIONS, "status"),
  urgency: oneOf(PRIORITY_OPTIONS, "priority")
};
