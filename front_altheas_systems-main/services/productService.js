import { fetchAllProducts, fetchProductById, fetchSimilarProducts } from "./api/catalogApi";

export async function getProductById(productId) {
  return fetchProductById(productId);
}

export async function getAllProducts() {
  return fetchAllProducts();
}

export async function getSimilarProducts(productId) {
  return fetchSimilarProducts(productId);
}