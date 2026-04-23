export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  catalogBaseUrl: process.env.NEXT_PUBLIC_CATALOG_API_BASE_URL || "http://localhost:8080",
  authCartBaseUrl: process.env.NEXT_PUBLIC_AUTH_CART_API_BASE_URL || "http://localhost:3000",
  useMocks: false,
  useMocksByDomain: {
    home: false,
    catalog: false,
    search: false,
    cart: false,
    checkout: false,
    auth: false,
  },
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};
