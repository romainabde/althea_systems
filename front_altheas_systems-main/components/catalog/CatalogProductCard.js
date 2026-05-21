"use client";

import Link from "next/link";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400";

export default function CatalogProductCard({ product }) {
  const inStock = product.inStock !== false;
  const priceLabel = Number.isFinite(product.price)
    ? product.price.toLocaleString("fr-FR")
    : "—";

  return (
    <Link
      href={`/products/${product.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        opacity: inStock ? 1 : 0.7,
        filter: inStock ? "none" : "grayscale(0.9)",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          border: "1px solid #f1f5f9",
          transition: "transform 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          if (inStock) e.currentTarget.style.transform = "translateY(-6px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div
          style={{
            height: "220px",
            overflow: "hidden",
            backgroundColor: "#f8fafc",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl || FALLBACK_IMG}
            alt={product.name || "Produit"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
        </div>

        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "1.2rem",
              color: "#0f172a",
              lineHeight: "1.4",
            }}
          >
            {product.name}
          </h4>
          <p
            style={{
              fontWeight: "bold",
              color: "#2563eb",
              fontSize: "1.4rem",
              margin: "0 0 15px 0",
            }}
          >
            {priceLabel} €
          </p>

          {!inStock && (
            <span
              style={{
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                padding: "5px 10px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                width: "fit-content",
                marginBottom: "15px",
              }}
            >
              Rupture de stock
            </span>
          )}

          <div
            style={{
              marginTop: "auto",
              paddingTop: "15px",
              borderTop: "1px solid #f1f5f9",
              color: "#64748b",
              fontSize: "0.95rem",
              fontWeight: "bold",
            }}
          >
            Détails du produit →
          </div>
        </div>
      </div>
    </Link>
  );
}
