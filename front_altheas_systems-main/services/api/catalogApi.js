import { API_ROUTES } from "../routes";
import { httpClient } from "../http/client";
import { API_CONFIG } from "../config";
import { categoriesMock, productsMock } from "../mocks/catalog.mock";

function mapProductWithImagesToCard(item) {
  const product = item?.product || item;
  const stock = typeof product?.stock === "number" ? product.stock : 0;
  return {
    id: product?.id,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? 0,
    category: product?.categoryName || "",
    inStock: stock > 0,
    images: item?.images || [],
  };
}

function mapProductWithImagesToDetail(item) {
  const product = item?.product || item;
  const stock = typeof product?.stock === "number" ? product.stock : 0;
  return {
    id: product?.id,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? 0,
    inStock: stock > 0,
    specifications: [],
    category: product?.categoryName || "",
    images: item?.images || [],
  };
}

export async function fetchAllProducts() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.catalog) {
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

  try {
    const page = await httpClient(API_ROUTES.products.list);
    const content = Array.isArray(page?.content) ? page.content : [];
    return content.map(mapProductWithImagesToCard);
  } catch (error) {
    return [];
  }
}

export async function fetchCategoryById(categoryId) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.catalog) {
    return categoriesMock[categoryId] || null;
  }

  try {
    return await httpClient(API_ROUTES.categories.byId(categoryId));
  } catch (error) {
    return null;
  }
}

export async function fetchProductsByCategory(categoryId) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.catalog) {
    const category = categoriesMock[categoryId];
    return category ? category.products : [];
  }

  try {
    const products = await httpClient(API_ROUTES.categories.products(categoryId));
    return (Array.isArray(products) ? products : []).map(mapProductWithImagesToCard);
  } catch (error) {
    return [];
  }
}

export async function fetchProductById(productId) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.catalog) {
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

  try {
    const data = await httpClient(API_ROUTES.products.byId(productId));
    return mapProductWithImagesToDetail(data);
  } catch (error) {
    return null;
  }
}

export async function fetchSimilarProducts(productId) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.catalog) {
    const allProducts = await fetchAllProducts();
    return allProducts
      .filter((product) => String(product.id) !== String(productId))
      .slice(0, 4);
  }

  try {
    const response = await httpClient(API_ROUTES.products.similar(productId));
    const products = Array.isArray(response?.similarProducts) ? response.similarProducts : [];
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price ?? 0,
      category: product.categoryName || "",
      inStock: typeof product.stock === "number" ? product.stock > 0 : false,
    }));
  } catch (error) {
    return [];
  }
}
