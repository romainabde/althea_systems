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
    addItem: "/api/cart/add",
    updateItem: (itemId) => `/api/cart/update/${itemId}`,
    deleteItem: (itemId) => `/api/cart/remove/${itemId}`,
  },
  search: {
    products: "/search/products",
    facets: "/search/facets",
    sortOptions: "/search/sort-options",
  },
  checkout: {
    init: "/api/orders/checkout",
    confirm: "/api/orders/pay",
  },
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
};
