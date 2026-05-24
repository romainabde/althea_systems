import { API_ROUTES } from "../routes";
import { httpClient } from "./http/client";
import { API_CONFIG } from "../config";
import { mockCatalogData } from "./mocks/catalog.mock";

/** Mock legacy shape : une entrée par « slug » de catégorie (ex. Imagerie). */
const categoriesMock = mockCatalogData;

function findProductInMockCatalog(productId) {
  for (const category of Object.values(mockCatalogData)) {
    const found = category.products?.find(
      (p) => String(p.id) === String(productId)
    );
    if (found) {
      return { product: found, categoryName: category.name };
    }
  }
  return null;
}

/** Nom affichable — GET /products/:id renvoie souvent { product, images }. */
export function getProductDisplayName(payload) {
  if (!payload) return null;
  const p = payload.product ?? payload;
  return p?.name ?? p?.title ?? p?.productName ?? null;
}

export async function fetchAllCategories() {
  if (API_CONFIG.useMocks) {
    return Object.entries(mockCatalogData).map(([slug, data], index) => ({
      id: slug,
      name: data.name,
      description: data.description,
      imageUrl: data.products?.[0]?.imageUrl ?? "",
      displayOrder: index,
      active: true,
    }));
  }

  return httpClient(API_ROUTES.categories.list);
}

export async function fetchAllProducts() {
  if (API_CONFIG.useMocks) {
    const products = Object.values(categoriesMock).flatMap((category) =>
      category.products.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: category.name,
        inStock:
          typeof item.inStock === "boolean" ? item.inStock : false,
      }))
    );

    return products;
  }

  const page = await httpClient(`${API_ROUTES.products.list}?page=0&size=500`);
  return Array.isArray(page?.content) ? page.content : [];
}

/**
 * GET /products (Spring Page : content = ProductWithImagesDto[])
 */
export async function fetchProductSearch(params = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 100;
  const sort = params.sort;

  if (API_CONFIG.useMocks) {
    let entries = [];
    for (const [, data] of Object.entries(mockCatalogData)) {
      const catName = data.name;
      for (const item of data.products || []) {
        entries.push({
          product: {
            id: item.id,
            name: item.name,
            price: item.price,
            stock: item.stockQuantity ?? 0,
            displayPriority: item.priority ?? 999,
            categoryName: catName,
            description:
              item.fullDescription ||
              item.description ||
              "",
          },
          images: [{ url: item.imageUrl }],
        });
      }
    }
    if (params.categories?.length) {
      const wanted = params.categories.map((c) => String(c).toLowerCase());
      entries = entries.filter((e) =>
        wanted.some((w) => {
          const n = e.product.categoryName?.toLowerCase() || "";
          return n === w || n.includes(w);
        })
      );
    }
    const start = page * size;
    const slice = entries.slice(start, start + size);
    return {
      content: slice,
      totalElements: entries.length,
      totalPages: Math.max(1, Math.ceil(entries.length / size)),
    };
  }

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  if (sort) qs.set("sort", sort);
  if (params.categories?.length) {
    for (const c of params.categories) {
      qs.append("categories", c);
    }
  }
  return httpClient(`${API_ROUTES.products.list}?${qs}`);
}

/**
 * Recherche catalogue alignée sur ProductSearchRequest (Spring GET /products).
 * Retourne une Page { content: ProductWithImagesDto[], totalElements, ... }.
 */
export async function searchCatalogProducts(filters = {}) {
  const pageIdx = filters.page ?? 0;
  const pageSize = filters.size ?? 200;

  if (API_CONFIG.useMocks) {
    const page = await fetchProductSearch({
      page: 0,
      size: 500,
      sort: filters.sort || "availability",
      categories: filters.categories,
    });
    let rows = [...(page.content || [])];

    const title = (filters.title || "").trim().toLowerCase();
    const desc = (filters.description || "").trim().toLowerCase();

    rows = rows.filter((row) => {
      const p = row.product || row;
      const name = (p.name || "").toLowerCase();
      const text = `${name} ${(p.description || "").toLowerCase()}`;
      if (title && !name.includes(title)) return false;
      if (desc && !text.includes(desc)) return false;

      const price = Number(p.price);
      if (
        filters.minPrice !== "" &&
        filters.minPrice != null &&
        !Number.isNaN(Number(filters.minPrice)) &&
        price < Number(filters.minPrice)
      ) {
        return false;
      }
      if (
        filters.maxPrice !== "" &&
        filters.maxPrice != null &&
        !Number.isNaN(Number(filters.maxPrice)) &&
        price > Number(filters.maxPrice)
      ) {
        return false;
      }

      if (filters.available === true) {
        const stock = p.stock != null ? Number(p.stock) : 0;
        if (!(stock > 0)) return false;
      }

      return true;
    });

    const start = pageIdx * pageSize;
    const slice = rows.slice(start, start + pageSize);
    return {
      content: slice,
      totalElements: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / pageSize)),
      number: pageIdx,
    };
  }

  const qs = new URLSearchParams();
  qs.set("page", String(pageIdx));
  qs.set("size", String(pageSize));
  if (filters.title?.trim()) qs.set("title", filters.title.trim());
  if (filters.description?.trim()) {
    qs.set("description", filters.description.trim());
  }
  if (
    filters.minPrice !== "" &&
    filters.minPrice != null &&
    !Number.isNaN(Number(filters.minPrice))
  ) {
    qs.set("minPrice", String(filters.minPrice));
  }
  if (
    filters.maxPrice !== "" &&
    filters.maxPrice != null &&
    !Number.isNaN(Number(filters.maxPrice))
  ) {
    qs.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.available === true) qs.set("available", "true");
  if (filters.categories?.length) {
    for (const c of filters.categories) {
      if (c) qs.append("categories", c);
    }
  }
  if (filters.sort) qs.set("sort", filters.sort);

  return httpClient(`${API_ROUTES.products.list}?${qs}`);
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
    const fromMock = findProductInMockCatalog(productId);
    if (fromMock) {
      const { product: item, categoryName } = fromMock;
      return {
        ...item,
        description: item.fullDescription || item.description,
        category: categoryName,
        inStock:
          typeof item.inStock === "boolean" ? item.inStock : false,
        specifications: item.technicalSpecs || [],
      };
    }

    return null;
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

/** Catégorie + liste produits (orchestration pour les pages catégorie). */
export async function getCategoryById(categoryId) {
  const category = await fetchCategoryById(categoryId);
  if (!category) return null;

  const products = await fetchProductsByCategory(categoryId);
  return { ...category, products };
}
