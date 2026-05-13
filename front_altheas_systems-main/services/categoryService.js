import { fetchCategoryById, fetchProductsByCategory } from "./api/catalogApi";

export async function getCategoryById(categoryId) {
  const category = await fetchCategoryById(categoryId);
  if (!category) return null;

  const products = await fetchProductsByCategory(categoryId);
  return { ...category, products };
}