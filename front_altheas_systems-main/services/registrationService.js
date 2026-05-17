import { API_CONFIG } from "./config";
import { buildRequestUrl } from "./http/client";
import { API_ROUTES } from "./routes";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REGISTRATION_MESSAGES = {
  fullNameRequired: "Le nom complet est obligatoire.",
  fullNameInvalid:
    "Indiquez votre prénom et votre nom (deux mots minimum, ex. : Jean Dupont).",
  emailRequired: "L'adresse e-mail est obligatoire.",
  emailInvalid: "Le format de l'adresse e-mail est invalide (ex. : contact@exemple.com).",
  passwordRequired: "Le mot de passe est obligatoire.",
  passwordWeak:
    "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.",
};

/**
 * Règles alignées sur auth-cart-service (authController) : 8+ caractères, maj, min, chiffre, caractère spécial.
 * @param {string} password
 * @returns {boolean}
 */
export function isPasswordStrongEnough(password) {
  if (typeof password !== "string" || password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

/**
 * @param {string} fullName
 * @returns {boolean}
 */
export function isFullNamePlausible(fullName) {
  const t = String(fullName || "").trim();
  if (t.length < 3) return false;
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  return parts.every((p) => p.length >= 1);
}

/**
 * @param {{ fullName: string, email: string, password: string }} fields
 * @returns {{ valid: true } | { valid: false, fieldErrors: Record<string, string> }}
 */
export function validateRegisterForm(fields) {
  const fullName = String(fields?.fullName ?? "").trim();
  const email = String(fields?.email ?? "").trim();
  const password = String(fields?.password ?? "");

  /** @type {Record<string, string>} */
  const fieldErrors = {};

  if (!fullName) {
    fieldErrors.fullName = REGISTRATION_MESSAGES.fullNameRequired;
  } else if (!isFullNamePlausible(fullName)) {
    fieldErrors.fullName = REGISTRATION_MESSAGES.fullNameInvalid;
  }

  if (!email) {
    fieldErrors.email = REGISTRATION_MESSAGES.emailRequired;
  } else if (!EMAIL_RE.test(email)) {
    fieldErrors.email = REGISTRATION_MESSAGES.emailInvalid;
  }

  if (!password) {
    fieldErrors.password = REGISTRATION_MESSAGES.passwordRequired;
  } else if (!isPasswordStrongEnough(password)) {
    fieldErrors.password = REGISTRATION_MESSAGES.passwordWeak;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }
  return { valid: true };
}

/**
 * @param {{ fullName: string, email: string, password: string }} payload
 * @returns {Promise<{ ok: true, message: string } | { ok: false, message: string, fieldErrors?: Record<string, string>, status?: number }>}
 */
export async function registerAccount(payload) {
  const { fullName, email, password } = payload;
  const clientCheck = validateRegisterForm({ fullName, email, password });
  if (!clientCheck.valid) {
    return {
      ok: false,
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: clientCheck.fieldErrors,
    };
  }

  const url = buildRequestUrl(API_ROUTES.auth.register);
  const res = await fetch(url, {
    method: "POST",
    headers: { ...API_CONFIG.defaultHeaders },
    body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password }),
    cache: "no-store",
  });

  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  const message =
    typeof data.message === "string"
      ? data.message
      : "Une erreur est survenue lors de l'inscription.";

  if (res.status === 201) {
    return { ok: true, message };
  }

  if (res.status === 400 && typeof data.message === "string") {
    return { ok: false, message, status: 400 };
  }

  return { ok: false, message, status: res.status };
}
