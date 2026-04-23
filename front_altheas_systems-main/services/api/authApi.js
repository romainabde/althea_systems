import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";
import { buildIdentityHeaders, setAuthToken } from "../auth/session";

export async function login(payload) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.auth) {
    return { message: "Mock login", token: "mock-token", user: { email: payload.email } };
  }

  const response = await httpClient(API_ROUTES.auth.login, {
    method: "POST",
    headers: buildIdentityHeaders(),
    body: JSON.stringify(payload),
  });

  if (response?.token) {
    setAuthToken(response.token);
  }

  return response;
}

export async function register(payload) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.auth) {
    return { message: "Mock register" };
  }

  return httpClient(API_ROUTES.auth.register, {
    method: "POST",
    headers: buildIdentityHeaders(),
    body: JSON.stringify(payload),
  });
}
