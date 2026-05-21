import { clearCartMirror } from "../utils/cart";

const TOKEN_KEY = "althea_auth_token";
const USER_KEY = "althea_auth_user";
/** Invité : header X-Session-Id pour `/api/cart` (auth-cart-service). */
const GUEST_SESSION_KEY = "althea_guest_session_id";

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

/** Nouvelle session invité (panier invité vide côté API après déconnexion). */
export function resetGuestSessionId() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Déconnexion : efface l’auth, le miroir local du panier et l’ID invité.
 * Le panier compte en base reste intact pour la prochaine connexion.
 */
export function prepareLogoutSession() {
  clearAuthSession();
  clearCartMirror();
  resetGuestSessionId();
}

/** Stockage qui contient le JWT (session ou local selon « Se souvenir de moi »). */
function getAuthStorage() {
  if (typeof window === "undefined") return null;
  if (sessionStorage.getItem(TOKEN_KEY)) return sessionStorage;
  if (localStorage.getItem(TOKEN_KEY)) return localStorage;
  return null;
}

/** Met à jour le JSON profil minimal après PUT /api/users/profile (sans changer le token). */
export function patchStoredAuthUser(partial) {
  if (typeof window === "undefined" || !partial || typeof partial !== "object") return;
  const store = getAuthStorage();
  if (!store) return;
  const prev = getAuthUser() || {};
  const merged = { ...prev, ...partial };
  store.setItem(USER_KEY, JSON.stringify(merged));
}

export function getOrCreateGuestSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(GUEST_SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(GUEST_SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
