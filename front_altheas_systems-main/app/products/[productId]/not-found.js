import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section style={{ padding: "1rem", maxWidth: "760px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.35rem" }}>Produit introuvable</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Le produit demandé n’existe pas ou n’est plus disponible.
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
