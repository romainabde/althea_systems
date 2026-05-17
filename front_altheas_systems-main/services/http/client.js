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
  const skipJsonContentType =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(skipJsonContentType ? {} : API_CONFIG.defaultHeaders),
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
    let serverMessage = "";
    try {
      const errBody = await response.clone().json();
      serverMessage =
        errBody?.message || errBody?.error || JSON.stringify(errBody);
    } catch {
      try {
        serverMessage = await response.text();
      } catch {
        // ignore
      }
    }
    const error = new Error(
      `API ${response.status}${serverMessage ? ` – ${serverMessage}` : ""}`
    );
    error.status = response.status;
    error.body = serverMessage;
    throw error;
  }

  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
