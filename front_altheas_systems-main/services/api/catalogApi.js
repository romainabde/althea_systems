import { API_ROUTES } from "../routes";
import { httpClient } from "../http/client";
import { API_CONFIG } from "../config";
import { categoriesMock, productsMock } from "../mocks/catalog.mock";

export async function fetchAllProducts() {
  if (API_CONFIG.useMocks) {
    const products = Object.values(categoriesMock).flatMap((category) =>
      category.products.map((item) => {
        const details = productsMock[item.id] || {};
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          category: category.name,
          inStock: typeof details.inStock === "boolean" ? details.inStock : false,
        };
      })
    );

    return products;
  }

  return httpClient(API_ROUTES.products.list);
}

export async function fetchCategoryById(categoryId) {
  if (API_CONFIG.useMocks) {
    return categoriesMock[categoryId] || null;
  }

  return httpClient(API_ROUTES.categories.byId(categoryId));
}

export async function fetchProductsByCategory(categoryId) {
  if (API_CONFIG.useMocks) {
    const category = categoriesMock[categoryId];
    return category ? category.products : [];
  }

  return httpClient(API_ROUTES.categories.products(categoryId));
}

export async function fetchProductById(productId) {
  if (API_CONFIG.useMocks) {
    const detailedProduct = productsMock[productId];
    if (detailedProduct) {
      return detailedProduct;
    }

    const fallbackProduct = Object.values(categoriesMock)
      .flatMap((category) =>
        category.products.map((item) => ({
          ...item,
          category: category.name,
        }))
      )
      .find((item) => String(item.id) === String(productId));

    if (!fallbackProduct) {
      return null;
    }

    return {
      id: fallbackProduct.id,
      name: fallbackProduct.name,
      description: `Description du produit ${fallbackProduct.name}.`,
      price: fallbackProduct.price,
      inStock: false,
      specifications: [],
    };
  }

  return httpClient(API_ROUTES.products.byId(productId));
}

export async function fetchSimilarProducts(productId) {
  if (API_CONFIG.useMocks) {
    const allProducts = await fetchAllProducts();
    return allProducts
      .filter((product) => String(product.id) !== String(productId))
      .slice(0, 4);
  }

  return httpClient(API_ROUTES.products.similar(productId));
}
