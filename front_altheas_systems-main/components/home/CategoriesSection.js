import Link from "next/link";

// AJOUT : on met une valeur par défaut "categories = []" au cas où l'API renvoie "undefined"
export default function CategoriesSection({ categories = [] }) {
  
  // AJOUT : Si la liste est vraiment vide, on affiche un petit message au lieu de planter
  if (!categories || categories.length === 0) {
    return (
      <section style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Catégories</h2>
        <p style={{ color: "#666" }}>Aucune catégorie disponible pour le moment.</p>
      </section>
    );
  }

  return (
    <section style={{ padding: "2rem" }}>
      <h2>Catégories</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
        }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#111",
              display: "block",
              textAlign: "center",
              backgroundColor: "#f8fafc",
              fontWeight: "600"
            }}
          >
            <p>{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}