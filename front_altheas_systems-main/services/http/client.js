import { API_CONFIG } from "../config";
import { getAuthToken } from "../authSession";

function resolveBaseUrl(endpoint) {
  if (endpoint.startsWith("/api/auth") || endpoint.startsWith("/api/users")) {
    return API_CONFIG.authBaseUrl;
  }
  if (
    endpoint.startsWith("/api/cart") ||
    endpoint.startsWith("/api/orders") ||
    endpoint.startsWith("/api/addresses")
  ) {
    return API_CONFIG.authBaseUrl;
  }
  if (endpoint.startsWith("/api/chat") || endpoint.startsWith("/api/form")) {
    return API_CONFIG.supportBaseUrl;
  }
  if (endpoint.startsWith("/admin")) {
    return API_CONFIG.adminBaseUrl;
  }
  return API_CONFIG.catalogBaseUrl;
}

export function buildRequestUrl(endpoint) {
  if (endpoint.startsWith("http")) return endpoint;
  const base = resolveBaseUrl(endpoint);
  return `${base}${endpoint}`;
}

const BEARER_PREFIX_ENDPOINTS = [
  "/api/cart",
  "/api/orders",
  "/api/addresses",
  "/api/users",
];

function shouldAttachBearer(endpoint) {
  return BEARER_PREFIX_ENDPOINTS.some((prefix) => endpoint.startsWith(prefix));
}

export async function httpClient(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...API_CONFIG.defaultHeaders,
    ...(options.headers || {}),
  };
  if (token && shouldAttachBearer(endpoint) && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildRequestUrl(endpoint), {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}
