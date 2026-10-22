export function getTokenPayload(token) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const payload = getTokenPayload(token);
  return Boolean(payload && (!payload.exp || payload.exp * 1000 > Date.now()));
}

export function isAdminToken(token) {
  return String(getTokenPayload(token)?.role || "").toLowerCase() === "admin";
}
