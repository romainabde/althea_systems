import { getCategoryById } from "../../../services/categoryService";
import ProductCard from "../../../components/products/ProductCard";

export default async function CategoryPage({ params }) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);

  if (!category) {
    return <h1 style={{ padding: "2rem" }}>Catégorie introuvable</h1>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{category.name}</h1>
      <p>{category.description}</p>

      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
        }}
      >
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}