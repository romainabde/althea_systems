const SESSION_STORAGE_KEY = "althea_session_id";
const TOKEN_STORAGE_KEY = "althea_auth_token";

function randomChunk() {
  return Math.random().toString(36).slice(2, 10);
}

export function getOrCreateSessionId() {
  if (typeof window === "undefined") return "server-session";

  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const created = `${Date.now()}-${randomChunk()}-${randomChunk()}`;
  localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function buildIdentityHeaders() {
  const headers = {
    "x-session-id": getOrCreateSessionId(),
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
