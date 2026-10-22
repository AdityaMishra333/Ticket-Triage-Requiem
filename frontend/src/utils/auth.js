// Decode the JWT payload locally; the backend has no profile endpoint.
export function getTokenPayload(token) {
  if (typeof token !== "string") return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isAdminToken(token) {
  return getTokenPayload(token)?.role === "admin";
}
