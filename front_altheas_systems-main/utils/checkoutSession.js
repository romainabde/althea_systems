/**
 * Données de commande en attente de paiement (session navigateur).
 * @typedef {{
 *   order: object;
 *   address?: object;
 *   transactionId?: string;
 * }} CheckoutOrderPayload
 */

const ORDER_KEY = "althea_checkout_order";
const LAST_CONFIRM_KEY = "althea_checkout_last_confirm";

/** @param {CheckoutOrderPayload} payload */
export function setPendingCheckoutOrder(payload) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

/** @returns {CheckoutOrderPayload | null} */
export function getPendingCheckoutOrder() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingCheckoutOrder() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ORDER_KEY);
  } catch {
    /* ignore */
  }
}

/** Après paiement réussi : affichage page confirmation si besoin */
export function setLastConfirmation({ orderId, transactionId, totalPaid }) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      LAST_CONFIRM_KEY,
      JSON.stringify({ orderId, transactionId, totalPaid })
    );
  } catch {
    /* ignore */
  }
}

export function getLastConfirmation() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_CONFIRM_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLastConfirmation() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LAST_CONFIRM_KEY);
  } catch {
    /* ignore */
  }
}
