import { API_CONFIG } from "../config";
import { httpClient } from "./http/client";
import { API_ROUTES } from "../routes";

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Envoie le formulaire public de contact au support-service (POST /api/form).
 * @returns {Promise<{ message?: string }>}
 */
export async function submitContactForm({
  email,
  subject,
  message,
  fullName,
}) {
  if (API_CONFIG.useMocks) {
    await sleep(400);
    return {
      message:
        "Votre message a bien été envoyé (simulation). Notre équipe vous contactera sous peu.",
    };
  }

  const body = {
    email: String(email ?? "").trim().toLowerCase(),
    subject: String(subject ?? "").trim(),
    message: String(message ?? "").trim(),
  };
  const name = fullName != null ? String(fullName).trim() : "";
  if (name) body.fullName = name;

  return httpClient(API_ROUTES.contact.submit, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
