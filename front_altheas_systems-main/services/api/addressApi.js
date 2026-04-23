import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { buildIdentityHeaders } from "../auth/session";

export async function createAddress(payload) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.checkout) {
    return { address: { id: 1, ...payload } };
  }

  return httpClient("/api/addresses", {
    method: "POST",
    headers: buildIdentityHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function fetchAddresses() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.checkout) {
    return [];
  }

  return httpClient("/api/addresses", {
    headers: buildIdentityHeaders(),
  });
}
