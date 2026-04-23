import Link from "next/link";

export default function CategoriesSection({ categories }) {
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
            }}
          >
            <p>{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}