const TOKEN_KEY = "althea_auth_token";
const USER_KEY = "althea_auth_user";

function readFromStores(key) {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(key) || localStorage.getItem(key);
}

/** JWT pour les appels API (client uniquement). */
export function getAuthToken() {
  return readFromStores(TOKEN_KEY);
}

/** Profil minimal renvoyé par POST /api/auth/login, si présent. */
export function getAuthUser() {
  const raw = readFromStores(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistSession({ token, user, rememberMe }) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_KEY);

  const store = rememberMe ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  if (user && typeof user === "object") {
    store.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_KEY);
}
