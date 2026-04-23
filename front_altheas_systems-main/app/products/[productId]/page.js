import Link from "next/link";
import AddToCartButton from "../../../components/cart/AddToCartButton";
import { getProductById, getSimilarProducts } from "../../../services/productService";

export default async function ProductDetailPage({ params }) {
  const { productId } = await params;
  const product = await getProductById(productId);

  if (!product) {
    return (
      <section style={{ padding: "1rem", maxWidth: "760px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "0.35rem" }}>Produit introuvable</h1>
        <p style={{ marginTop: 0, color: "#555" }}>
          Ce produit n’existe pas encore dans les données mock.
        </p>
        <Link
          href="/products"
          style={{
            marginTop: "0.75rem",
            display: "inline-block",
            padding: "0.7rem 1rem",
            borderRadius: "8px",
            background: "#003d5c",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Retour au catalogue
        </Link>
      </section>
    );
  }

  const similarProducts = await getSimilarProducts(productId);

  return (
    <section style={{ padding: "1rem", maxWidth: "760px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.35rem" }}>{product.name}</h1>
      <p style={{ marginTop: 0, color: "#555" }}>{product.description}</p>

      <article
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "1rem",
          marginTop: "1rem",
          background: "#fff",
        }}
      >
        <p style={{ margin: 0, fontWeight: 700 }}>Prix : {product.price} €</p>
        <p
          style={{
            margin: "0.5rem 0 0 0",
            color: product.inStock ? "#15803d" : "#b91c1c",
            fontWeight: 600,
          }}
        >
          {product.inStock ? "En stock" : "Rupture de stock"}
        </p>
        <AddToCartButton product={product} />
      </article>

      {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
        <article
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1rem",
            marginTop: "1rem",
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Caractéristiques techniques</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.35rem" }}>
            {product.specifications.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <article
        style={{
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "1rem",
          marginTop: "1rem",
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Produits similaires</h2>
        {similarProducts.length === 0 ? (
          <p style={{ marginBottom: 0 }}>Aucun produit similaire pour le moment.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "10px",
                  padding: "0.75rem",
                  textDecoration: "none",
                  color: "#111",
                  background: "#fff",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                <p style={{ margin: "0.35rem 0 0 0", color: "#555" }}>
                  {item.category} - {item.price} €
                </p>
                <p style={{ margin: "0.35rem 0 0 0", color: item.inStock ? "#15803d" : "#b91c1c" }}>
                  {item.inStock ? "En stock" : "Rupture de stock"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
