import {
  fetchSearchFacets,
  fetchSearchProducts,
  fetchSearchSortOptions,
} from "./api/searchApi";

export async function searchProducts(params) {
  return fetchSearchProducts(params);
}

export async function getSearchFilters() {
  const [facets, sortOptions] = await Promise.all([
    fetchSearchFacets(),
    fetchSearchSortOptions(),
  ]);

  return {
    facets,
    sortOptions,
  };
}
