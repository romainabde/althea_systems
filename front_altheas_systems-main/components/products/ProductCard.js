import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      style={{
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "12px",
        textDecoration: "none",
        color: "#111",
        display: "block",
      }}
    >
      <h3>{product.name}</h3>
      <p>{product.price} €</p>
    </Link>
  );
}