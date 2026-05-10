/**
 * Chemins relatifs — le host est choisi dans http/client.js :
 * - /api/auth, /api/users, /api/cart, /api/orders, /api/addresses → auth (8080)
 * - /api/chat, /api/form → support (8081)
 * - /admin/* → admin (8083)
 * - le reste → catalog (8082)
 */
export const API_ROUTES = {
  home: {
    getPage: "/home",
  },
  categories: {
    list: "/categories",
    byId: (categoryId) => `/categories/${categoryId}`,
    products: (categoryId) => `/categories/${categoryId}/products`,
  },
  products: {
    list: "/products",
    byId: (productId) => `/products/${productId}`,
    images: (productId) => `/products/${productId}/images`,
    availability: (productId) => `/products/${productId}/availability`,
    similar: (productId) => `/products/${productId}/similar`,
  },
  cart: {
    get: "/api/cart",
    total: "/api/cart/total",
    validate: "/api/cart/validate",
    addItem: "/api/cart/add",
    updateItem: (productId) => `/api/cart/update/${productId}`,
    deleteItem: (productId) => `/api/cart/remove/${productId}`,
    clear: "/api/cart/clear",
  },
  /** Recherche : même service que le catalogue ; GET /products avec query params côté catalog-service */
  search: {
    products: "/products",
    facets: "/products/facets",
    sortOptions: "/products/sort-options",
  },
  /** Commande / paiement : auth-cart-service */
  checkout: {
    init: "/api/orders/checkout",
    state: "/api/orders/checkout/draft",
    summary: "/api/orders/checkout/summary",
    confirm: "/api/orders/pay",
    result: "/api/orders/checkout/result",
  },
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    confirmEmail: "/api/auth/confirm-email",
    logout: "/api/auth/logout",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: (token) => `/api/auth/reset-password/${token}`,
    verifyEmail: (token) => `/api/auth/verify-email/${token}`,
    resendConfirmation: "/api/auth/resend-confirmation",
  },
  users: {
    updateProfile: "/api/users/profile",
    addAddress: "/api/users/addresses",
  },
  addresses: {
    list: "/api/addresses",
    create: "/api/addresses",
  },
  contact: {
    submit: "/api/form",
  },
  chatbot: {
    start: "/api/chat/start",
    message: "/api/chat/message",
    end: "/api/chat/end",
    escalate: "/api/chat/escalate",
  },
};
