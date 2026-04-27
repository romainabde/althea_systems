import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";
import { searchMock } from "../mocks/search.mock";

export async function fetchSearchProducts(params = {}) {
  if (API_CONFIG.useMocks) {
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

  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `${API_ROUTES.search.products}?${queryString}` : API_ROUTES.search.products;
  return httpClient(endpoint);
}

export async function fetchSearchFacets() {
  if (API_CONFIG.useMocks) {
    return searchMock.facets;
  }
  return httpClient(API_ROUTES.search.facets);
}

export async function fetchSearchSortOptions() {
  if (API_CONFIG.useMocks) {
    return searchMock.sortOptions;
  }
  return httpClient(API_ROUTES.search.sortOptions);
}
