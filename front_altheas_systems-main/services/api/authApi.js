import { persistSession } from "../authSession";
import { API_CONFIG } from "../config";
import { buildRequestUrl } from "../http/client";
import { API_ROUTES } from "../routes";

/**
 * Après validation du lien e-mail (token JWT) : le backend confirme le compte et renvoie une session.
 * @param {{ token: string, rememberMe?: boolean }} p
 */
export async function confirmEmailAndLogin({ token, rememberMe }) {
  const url = buildRequestUrl(API_ROUTES.auth.confirmEmail);
  const res = await fetch(url, {
    method: "POST",
    headers: { ...API_CONFIG.defaultHeaders },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });

  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    return {
      ok: false,
      message:
        typeof data.message === "string"
          ? data.message
          : "Le lien de confirmation est invalide ou a expiré.",
    };
  }

  if (typeof data.token !== "string") {
    return { ok: false, message: "Réponse invalide du serveur." };
  }

  persistSession({
    token: data.token,
    user: data.user,
    rememberMe: !!rememberMe,
  });

  return { ok: true, message: data.message, user: data.user };
}

/**
 * Connexion alignée sur auth-cart-service : body { email, password, rememberMe? }.
 */
export async function loginWithCredentials({ email, password, rememberMe }) {
  const url = buildRequestUrl(API_ROUTES.auth.login);
  const res = await fetch(url, {
    method: "POST",
    headers: { ...API_CONFIG.defaultHeaders },
    body: JSON.stringify({
      email,
      password,
      rememberMe: !!rememberMe,
    }),
    cache: "no-store",
  });

  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message:
        typeof data.message === "string"
          ? data.message
          : `Erreur ${res.status}`,
    };
  }

  if (typeof data.token !== "string") {
    return { ok: false, message: "Réponse invalide du serveur." };
  }

  persistSession({
    token: data.token,
    user: data.user,
    rememberMe: !!rememberMe,
  });

  return { ok: true, user: data.user };
}
