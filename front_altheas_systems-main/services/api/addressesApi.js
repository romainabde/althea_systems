import { httpClient } from "./http/client";
import { API_ROUTES } from "../routes";

/**
 * Liste les adresses du client connecté (JWT) ou de la session invité (X-Session-Id).
 * @returns {Promise<Array<object>>}
 */
export async function fetchMyAddresses() {
  const data = await httpClient(API_ROUTES.addresses.list, { method: "GET" });
  return Array.isArray(data) ? data : [];
}

/**
 * Crée une adresse (champs alignés sur auth-cart-service POST /api/addresses).
 * @param {{
 *   firstName: string;
 *   lastName: string;
 *   street: string;
 *   city: string;
 *   zipCode: string;
 *   country: string;
 *   phone: string;
 * }} payload
 */
export async function createAddress(payload) {
  const body = {
    firstName: String(payload.firstName || "").trim(),
    lastName: String(payload.lastName || "").trim(),
    street: String(payload.street || "").trim(),
    city: String(payload.city || "").trim(),
    zipCode: String(payload.zipCode || "").trim(),
    country: String(payload.country || "").trim(),
    phone: String(payload.phone || "").trim(),
  };

  return httpClient(API_ROUTES.addresses.create, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Met à jour une adresse (PUT /api/addresses/:id).
 * @param {number} addressId
 * @param {{
 *   firstName: string;
 *   lastName: string;
 *   street: string;
 *   city: string;
 *   zipCode: string;
 *   country: string;
 *   phone: string;
 * }} payload
 */
export async function updateAddress(addressId, payload) {
  const body = {
    firstName: String(payload.firstName || "").trim(),
    lastName: String(payload.lastName || "").trim(),
    street: String(payload.street || "").trim(),
    city: String(payload.city || "").trim(),
    zipCode: String(payload.zipCode || "").trim(),
    country: String(payload.country || "").trim(),
    phone: String(payload.phone || "").trim(),
  };

  return httpClient(API_ROUTES.addresses.byId(addressId), {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** Supprime une adresse (DELETE /api/addresses/:id). Réponse 204 sans corps. */
export async function deleteAddress(addressId) {
  return httpClient(API_ROUTES.addresses.byId(addressId), {
    method: "DELETE",
  });
}
