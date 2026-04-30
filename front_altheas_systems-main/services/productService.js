import { mockCatalogData } from './mocks/catalog.mock';

// Récupérer tous les produits (on parcourt toutes les catégories du catalogue)
export async function getProducts() {
  let allProducts = [];
  
  // On boucle sur chaque catégorie (Imagerie, Chirurgie...) pour extraire leurs produits
  for (const categoryKey in mockCatalogData) {
    const category = mockCatalogData[categoryKey];
    if (category.products) {
      allProducts = [...allProducts, ...category.products];
    }
  }
  
  return allProducts;
}

// Optionnel : Récupérer un seul produit par son ID
export async function getProductById(id) {
  const products = await getProducts();
  return products.find(product => product.id === id);
}