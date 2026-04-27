import { persistSession } from "../authSession";
import { API_CONFIG } from "../config";
import { buildRequestUrl } from "../http/client";
import { API_ROUTES } from "../routes";

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
