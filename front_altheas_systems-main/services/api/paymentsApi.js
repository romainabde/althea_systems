import { httpClient } from "./http/client";
import { API_ROUTES } from "../routes";

/**
 * @returns {Promise<Array<object>>}
 */
export async function fetchMyPaymentMethods() {
  const data = await httpClient(API_ROUTES.users.listPayments, { method: "GET" });
  if (Array.isArray(data?.paymentMethods)) return data.paymentMethods;
  if (Array.isArray(data)) return data;
  return [];
}

/**
 * Enregistre une carte Stripe déjà tokenisée côté navigateur.
 * @param {{ paymentMethodId: string; cardName?: string }} payload
 */
export async function addPaymentMethod(payload) {
  return httpClient(API_ROUTES.users.addPayment, {
    method: "POST",
    body: JSON.stringify({
      paymentMethodId: String(payload.paymentMethodId || "").trim(),
      cardName: payload.cardName?.trim() || undefined,
    }),
  });
}

/** @param {number} paymentMethodId */
export async function deletePaymentMethod(paymentMethodId) {
  return httpClient(API_ROUTES.users.deletePayment(paymentMethodId), {
    method: "DELETE",
  });
}
