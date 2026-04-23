import { API_CONFIG } from "../config";

function buildRequestUrl(endpoint) {
  if (typeof endpoint !== "string") {
    throw new Error("httpClient endpoint must be a string");
  }
  if (endpoint.startsWith("http")) return endpoint;
  if (endpoint.startsWith("/api/")) return `${API_CONFIG.authCartBaseUrl}${endpoint}`;
  return `${API_CONFIG.catalogBaseUrl || API_CONFIG.baseUrl}${endpoint}`;
}

export async function httpClient(endpoint, options = {}) {
  const url = buildRequestUrl(endpoint);
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.defaultHeaders,
        ...(options.headers || {}),
      },
      cache: options.cache || "no-store",
    });
  } catch (error) {
    throw new Error(`Network error calling ${url}: ${error?.message || "fetch failed"}`);
  }

  if (!response.ok) {
    const error = new Error(`API request failed with status ${response.status} for ${url}`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
