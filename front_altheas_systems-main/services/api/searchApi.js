import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";
import { searchMock } from "../mocks/search.mock";

export async function fetchSearchProducts(params = {}) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.search) {
    const query = (params.query || "").trim().toLowerCase();
    const category = params.category || "";
    const priceRange = params.priceRange || "";
    const onlyAvailable = params.onlyAvailable === "true" || params.onlyAvailable === true;
    const sort = params.sort || "price_asc";

    let products = searchMock.products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesCategory = !category || product.category === category;
      const matchesAvailability = !onlyAvailable || product.inStock;

      let matchesPrice = true;
      if (priceRange === "0-500") {
        matchesPrice = product.price <= 500;
      } else if (priceRange === "500-1000") {
        matchesPrice = product.price > 500 && product.price <= 1000;
      } else if (priceRange === "1000+") {
        matchesPrice = product.price > 1000;
      }

      return matchesQuery && matchesCategory && matchesAvailability && matchesPrice;
    });

    products = [...products].sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "newest") return Number(b.isNew) - Number(a.isNew);
      if (sort === "availability") return Number(b.inStock) - Number(a.inStock);
      return 0;
    });

    return { products, total: products.length };
  }

  const backendParams = new URLSearchParams();
  if (params.query) {
    backendParams.set("title", params.query);
    backendParams.set("description", params.query);
  }
  if (params.category) backendParams.append("categories", params.category);
  if (params.onlyAvailable) backendParams.set("available", "true");
  if (params.sort) backendParams.set("sort", params.sort);

  if (params.priceRange === "0-500") {
    backendParams.set("maxPrice", "500");
  } else if (params.priceRange === "500-1000") {
    backendParams.set("minPrice", "500");
    backendParams.set("maxPrice", "1000");
  } else if (params.priceRange === "1000+") {
    backendParams.set("minPrice", "1000");
  }

  const queryString = backendParams.toString();
  const endpoint = queryString ? `${API_ROUTES.products.list}?${queryString}` : API_ROUTES.products.list;
  try {
    const page = await httpClient(endpoint);
    const content = Array.isArray(page?.content) ? page.content : [];

    return {
      products: content.map((item) => {
        const product = item?.product || {};
        return {
          id: product.id,
          name: product.name,
          description: product.description || "",
          category: product.categoryName || "",
          price: product.price ?? 0,
          inStock: typeof product.stock === "number" ? product.stock > 0 : false,
        };
      }),
      total: page?.totalElements ?? 0,
    };
  } catch (error) {
    return { products: [], total: 0 };
  }
}

export async function fetchSearchFacets() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.search) {
    return searchMock.facets;
  }

  try {
    const categories = await httpClient(API_ROUTES.categories.list);
    return {
      categories: (Array.isArray(categories) ? categories : []).map((item) => item.name),
      priceRanges: ["0-500", "500-1000", "1000+"],
    };
  } catch (error) {
    return {
      categories: [],
      priceRanges: ["0-500", "500-1000", "1000+"],
    };
  }
}

export async function fetchSearchSortOptions() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.search) {
    return searchMock.sortOptions;
  }
  return ["price_asc", "price_desc", "newest", "availability"];
}
