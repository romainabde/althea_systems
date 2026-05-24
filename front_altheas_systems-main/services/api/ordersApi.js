import { API_CONFIG } from "../config";
import { httpClient } from "./http/client";
import { API_ROUTES } from "../routes";

/**
 * Commandes de l’utilisateur connecté (Bearer obligatoire hors mocks).
 * @returns {Promise<{ orders: Array }>}
 */
export async function fetchMyOrders() {
  if (API_CONFIG.useMocks) {
    return { orders: [] };
  }

  return httpClient(API_ROUTES.orders.mine);
}

/**
 * Détail d'une commande (JWT obligatoire, propriétaire uniquement).
 * @param {number} orderId
 * @returns {Promise<{ order: object }>}
 */
export async function fetchOrderById(orderId) {
  if (API_CONFIG.useMocks) {
    return { order: null };
  }

  return httpClient(API_ROUTES.orders.byId(Number(orderId)));
}
