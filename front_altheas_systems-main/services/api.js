import { httpClient } from "./http/client";

export async function apiFetch(endpoint, options = {}) {
  return httpClient(endpoint, options);
}