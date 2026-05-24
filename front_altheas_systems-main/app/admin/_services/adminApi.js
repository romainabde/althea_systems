// =============================================================================
// adminApi.js
// -----------------------------------------------------------------------------
// Branchements REST contre admin-service (Spring Boot, port 8083 par défaut).
//
// Toutes les routes commencent par "/admin/...". Le httpClient partagé
// (services/api/http/client.js) résout automatiquement la base URL via
// API_CONFIG.adminBaseUrl (NEXT_PUBLIC_ADMIN_API_URL).
//
// Format d'erreur du back :
//   { success: false, message: "..." }   (HTTP 400 / 404 / 500)
//
// Le httpClient lève une Error si la réponse n'est pas 2xx ; on capture côté
// composant pour afficher un message à l'utilisateur si besoin.
// =============================================================================

import { httpClient } from "../../../services/api/http/client";

// ----------------------------- helpers ---------------------------------------

function buildQuery(params) {
  if (!params || typeof params !== "object") return "";
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") usp.append(key, v);
      });
    } else {
      usp.append(key, value);
    }
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

function get(path, params) {
  return httpClient(`${path}${buildQuery(params)}`, { method: "GET" });
}

function post(path, body) {
  return httpClient(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

function put(path, body) {
  return httpClient(path, {
    method: "PUT",
    body: JSON.stringify(body ?? {}),
  });
}

function patch(path, body) {
  return httpClient(path, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
}

function del(path, params) {
  return httpClient(`${path}${buildQuery(params)}`, { method: "DELETE" });
}

// ----------------------------- Produits --------------------------------------
// Routes : /admin/products
// DTOs : ProductWithImagesDto { product: ProductDto, images: ProductImage[] }
// ProductDto: { id, name, description, price, stock, displayPriority,
//               active, createdAt, updatedAt, categoryId, categoryName }
// -----------------------------------------------------------------------------
export const productsApi = {
  list: (params) => get("/admin/products", params),
  get: (id) => get(`/admin/products/${id}`),
  create: (data) => post("/admin/products", data),
  update: (id, data) => put(`/admin/products/${id}`, data),
  remove: (id) => del(`/admin/products/${id}`, { confirm: true }),
  // pas de bulk natif : on lance N requêtes en parallèle
  removeMany: (ids) =>
    Promise.all((ids ?? []).map((id) => productsApi.remove(id))),
  updateStock: (id, data) => put(`/admin/products/${id}/stock`, data),
  addImage: (id, data) => post(`/admin/products/${id}/images`, data),
  /** multipart/form-data — body doit être un FormData avec la clé `file` et optionnellement `altText` */
  addImageFile: (id, formData) =>
    httpClient(`/admin/products/${id}/images`, {
      method: "POST",
      body: formData,
    }),
  deleteImage: (id, imageId) =>
    httpClient(`/admin/products/${id}/images/${imageId}`, { method: "DELETE" }),
};

// ----------------------------- Catégories ------------------------------------
// Routes : /admin/categories
// Le back renvoie les entités Category telles quelles (pas de DTO).
// Champs : { id, name, description, imageUrl, displayOrder, active,
//            createdAt, updatedAt }
// -----------------------------------------------------------------------------
export const categoriesApi = {
  list: () => get("/admin/categories"),
  get: (id) => get(`/admin/categories/${id}`),
  create: (data) => post("/admin/categories", data),
  update: (id, data) => put(`/admin/categories/${id}`, data),
  uploadCategoryImageFile: (id, formData) =>
    httpClient(`/admin/categories/${id}/image`, {
      method: "POST",
      body: formData,
    }),
  deleteUploadedImage: (id) =>
    httpClient(`/admin/categories/${id}/image`, { method: "DELETE" }),
  remove: (id) => del(`/admin/categories/${id}`),
  removeMany: (ids) =>
    Promise.all((ids ?? []).map((id) => categoriesApi.remove(id))),
  productsByCategory: (categoryId) =>
    get(`/admin/categories/${categoryId}/products`),
};

// ----------------------------- Commandes -------------------------------------
// Routes : /admin/orders
// DTOs : OrderSummaryDto pour la liste, OrderDetailDto pour le détail.
// -----------------------------------------------------------------------------
export const ordersApi = {
  list: (params) => get("/admin/orders", params),
  get: (id) => get(`/admin/orders/${id}`),
  updateStatus: (id, data) => put(`/admin/orders/${id}/status`, data),
  refund: (id) => post(`/admin/orders/${id}/refund`),
  // Pas de DELETE natif côté back — on désactive la suppression côté UI.
  removeMany: () =>
    Promise.reject(
      new Error("La suppression de commandes n'est pas supportée par le back.")
    ),
};

// ----------------------------- Utilisateurs ----------------------------------
// Routes : /admin/users
// DTO : UserDto { id, fullName, email, role, status, locked,
//                 isEmailConfirmed, createdAt }
// -----------------------------------------------------------------------------
export const usersApi = {
  list: () => get("/admin/users"),
  get: (id) => get(`/admin/users/${id}`),
  update: (id, data) => put(`/admin/users/${id}`, data),
  remove: (id) => del(`/admin/users/${id}`),
  removeMany: (ids) =>
    Promise.all((ids ?? []).map((id) => usersApi.remove(id))),
  purchases: (id) => get(`/admin/users/${id}/purchases`),
  addresses: (id) => get(`/admin/users/${id}/addresses`),
};

// ----------------------------- Home / CMS ------------------------------------
// Routes : /admin/home/*
// Entités Carousel/HomepageText/Footer/TopProduct retournées brutes par le back.
// -----------------------------------------------------------------------------
export const homeCmsApi = {
  // Carrousel
  getCarousel: () => get("/admin/home/carousel"),
  createCarouselSection: (data) => post("/admin/home/carousel/sections", data),
  updateCarouselSection: (id, data) =>
    patch(`/admin/home/carousel/${id}`, data),
  deleteCarouselSection: (id) =>
    httpClient(`/admin/home/carousel/${id}`, { method: "DELETE" }),
  /** multipart/form-data — body FormData avec la clé `file`, optionnellement `altText` */
  uploadCarouselSectionImage: (id, formData) =>
    httpClient(`/admin/home/carousel/${id}/image`, {
      method: "POST",
      body: formData,
    }),
  deleteCarouselSectionImage: (id) =>
    httpClient(`/admin/home/carousel/${id}/image`, { method: "DELETE" }),

  // Texte d'accueil (1 seule ressource — UPDATE uniquement)
  getHomepageText: () => get("/admin/home/homepage-text"),
  updateHomepageText: (data) => patch("/admin/home/homepage-text", data),

  // Top produits
  getTopProducts: () => get("/admin/home/top-products"),
  addTopProduct: (data) => put("/admin/home/top-products", data),
  removeTopProduct: (id) =>
    httpClient(`/admin/home/top-products/${id}`, { method: "DELETE" }),

  // Footer (1 seule ressource — UPDATE uniquement)
  getFooter: () => get("/admin/home/footer"),
  updateFooter: (data) => patch("/admin/home/footer", data),
};

// ----------------------------- Contact (messages) ----------------------------
// Routes : /admin/contact/messages
// DTO : ContactMessageDto { id, fullName, email, subject, message, status,
//                           createdAt, responseMessage, respondedBy,
//                           respondedAt }
// -----------------------------------------------------------------------------
export const contactApi = {
  list: () => get("/admin/contact/messages"),
  get: (id) => get(`/admin/contact/messages/${id}`),
  respond: (id, data) => post(`/admin/contact/messages/${id}/respond`, data),
  // Pas de DELETE natif côté back — bulk désactivé.
  removeMany: () =>
    Promise.reject(
      new Error("La suppression de messages n'est pas supportée par le back.")
    ),
};

// ----------------------------- Paiements -------------------------------------
// Routes : /admin/payments
// DTO : PaymentDto { id, orderId, providerPaymentId, amount, currency,
//                    status, createdAt, updatedAt, refundedAt }
// -----------------------------------------------------------------------------
export const paymentsApi = {
  list: () => get("/admin/payments"),
  get: (id) => get(`/admin/payments/${id}`),
  refund: (id) => post(`/admin/payments/${id}/refund`),
};

// ----------------------------- Dashboard -------------------------------------
// Routes : /admin/dashboard/*
// Tous acceptent ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//   - GET /admin/dashboard/sales/daily        → DailySalesDto[] { day, totalSales }
//   - GET /admin/dashboard/sales/weekly       → WeeklySalesDto[] { week, totalSales }
//   - GET /admin/dashboard/average-basket     → AverageBasketByCategoryDto[] { categoryId, categoryName, averageBasket }
//   - GET /admin/dashboard/category-sales     → CategorySalesDto[] { categoryId, categoryName, sales, percentage }
// -----------------------------------------------------------------------------
export const dashboardApi = {
  dailySales: (params) => get("/admin/dashboard/sales/daily", params),
  weeklySales: (params) => get("/admin/dashboard/sales/weekly", params),
  averageBasket: (params) => get("/admin/dashboard/average-basket", params),
  categorySales: (params) => get("/admin/dashboard/category-sales", params),
};

// =============================================================================
// Export groupé
// =============================================================================
const adminApi = {
  products: productsApi,
  categories: categoriesApi,
  orders: ordersApi,
  users: usersApi,
  homeCms: homeCmsApi,
  contact: contactApi,
  payments: paymentsApi,
  dashboard: dashboardApi,
};

export default adminApi;
