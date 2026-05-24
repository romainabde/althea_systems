import { getCategoryById } from "../../../services/api/catalogApi";
import ProductCard from "../../../components/products/ProductCard";

/** Catalogue renvoie souvent ProductWithImagesDto { product, images } ; ProductCard attend un produit plat. */
function unwrapCategoryProduct(entry) {
  if (!entry) return null;
  if (entry.product != null) return entry.product;
  return entry;
}

export default async function CategoryPage({ params }) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);

  if (!category) {
    return <h1 style={{ padding: "2rem" }}>Catégorie introuvable</h1>;
  }

  const rawProducts = Array.isArray(category.products) ? category.products : [];
  const flatProducts = rawProducts.map(unwrapCategoryProduct).filter(Boolean);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{category.name}</h1>
      <p>{category.description}</p>

      {flatProducts.length === 0 ? (
        <p style={{ marginTop: "2rem", color: "#64748b" }}>
          Aucun produit dans cette catégorie pour le moment.
        </p>
      ) : (
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
          }}
        >
          {flatProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}