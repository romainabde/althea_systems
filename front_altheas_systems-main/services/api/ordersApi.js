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
