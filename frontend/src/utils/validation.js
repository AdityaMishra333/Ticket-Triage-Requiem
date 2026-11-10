export const LIMITS = {
  name: { min: 2, max: 60 },
  email: { max: 254 },
  password: { min: 6, newMin: 8, maxBytes: 72 },
  subject: { min: 3, max: 120 },
  item: { min: 2, max: 100 },
  problem: { min: 10, max: 2000 },
  ticketId: { max: 40 },
  search: { max: 100 }
};

export const MIN_SERVICE_DATE = "2000-01-01";

export const todayLocal = () => {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const DEPARTMENT_OPTIONS = ["IT", "Facilities", "HR", "Finance", "Customer Support", "Unassigned"]
  .map((value) => [value, value]);
export const CATEGORY_OPTIONS = [["billing", "Billing"], ["technical", "Technical"], ["account", "Account"], ["delivery", "Delivery"], ["other", "Other"], ["general", "General"]];
export const STATUS_OPTIONS = [["new", "Received"], ["classified", "Classified"], ["submitted", "Submitted"], ["awaiting_approval", "Approval"], ["assigned", "Assigned"], ["in_progress", "Working"], ["resolving", "Resolving"], ["resolved", "Resolved"], ["closed", "Closed"]];
export const EDITABLE_STATUS_OPTIONS = [["new", "Received"], ["awaiting_approval", "Approval"], ["in_progress", "Working"], ["resolved", "Resolved"]];
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime())
    || parsed.getDate() !== Number(date.slice(8))) {
    return "Enter a valid service date.";
  }
  if (date > todayLocal()) return "Service date cannot be in the future.";
  if (date < MIN_SERVICE_DATE) return "Service date cannot be before the year 2000.";
  return "";
};

export const normalizeTicketId = (value) => clean(value).replace(/^#/, "").toUpperCase();

export const validateTicketId = (value) => {
  const id = normalizeTicketId(value);
  if (!id) return "Please enter a ticket reference ID.";
  if (id.length > LIMITS.ticketId.max || !/^TKT-[A-Z0-9]+(-[A-Z0-9]+)*$/.test(id)) {
    return "Enter a valid ticket ID, e.g. TKT-MABC123XY.";
  }
  return "";
};

const validateLoginPassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < LIMITS.password.min) return `Password must be at least ${LIMITS.password.min} characters.`;
  return "";
};

const validateNewPassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < LIMITS.password.newMin) return `Password must be at least ${LIMITS.password.newMin} characters.`;
  if (new TextEncoder().encode(value).length > LIMITS.password.maxBytes) {
    return `Password must be at most ${LIMITS.password.maxBytes} characters.`;
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return "Password must include an uppercase letter, a lowercase letter and a number.";
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
