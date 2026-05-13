import ProductCard from "../products/ProductCard";

export default function TopProductsSection({ products }) {
  if (!products || products.length === 0) {
    return <p style={{textAlign: "center"}}>Aucun produit phare pour le moment.</p>;
  }
  return (
    <section style={{ padding: "2rem" }}>
      <h2>Top Produits du moment</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}