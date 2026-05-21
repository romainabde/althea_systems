import { API_CONFIG } from "../config";
import { httpClient } from "./http/client";

/**
 * Crée une commande en attente de paiement (auth-cart-service).
 * POST /api/orders/checkout — body : { addressId, email? } (email obligatoire invité ; le front force login au checkout).
 *
 * @param {{ addressId: number; email?: string }} payload
 * @returns {Promise<{ message?: string; order: object }>}
 */
export async function postCreateOrder(payload) {
  if (API_CONFIG.useMocks) {
    return {
      message: "Mock commande",
      order: {
        id: 9001,
        totalAmount: 199,
        status: "PENDING",
        items: [],
      },
    };
  }

  const body = { addressId: Number(payload.addressId) };
  if (payload.email?.trim()) {
    body.email = payload.email.trim();
  }

  return httpClient("/api/orders/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Confirme le paiement Stripe et marque la commande comme payée.
 * POST /api/orders/pay — body : { orderId, paymentMethodId }
 *
 * @param {{ orderId: number; paymentMethodId: string }} payload
 * @returns {Promise<{ message?: string; transactionId?: string }>}
 */
export async function postPayOrder(payload) {
  if (API_CONFIG.useMocks) {
    return {
      message: "Paiement mock OK",
      transactionId: "pi_mock_" + Date.now(),
    };
  }

  return httpClient("/api/orders/pay", {
    method: "POST",
    body: JSON.stringify({
      orderId: Number(payload.orderId),
      paymentMethodId: String(payload.paymentMethodId || "").trim(),
    }),
  });
}
