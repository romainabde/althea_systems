"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200";

export default function SearchProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const inStock = product.inStock !== false;
  const priceLabel = Number.isFinite(product.price)
    ? product.price.toLocaleString("fr-FR")
    : "—";

  async function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!inStock || adding) return;
    setAdding(true);
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
      });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        padding: "20px",
        transition: "all 0.3s",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Link
        href={`/products/${product.id}`}
        style={{ textDecoration: "none", flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            height: "220px",
            borderRadius: "18px",
            overflow: "hidden",
            backgroundColor: "#f8fafc",
            marginBottom: "20px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: inStock ? 1 : 0.85,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl || FALLBACK_IMG}
            alt={product.name || "Produit"}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
          {product.isPriority && (
            <span
              style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                backgroundColor: "#2563eb",
                color: "white",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.7rem",
                fontWeight: "bold",
              }}
            >
              NOUVEAU
            </span>
          )}
        </div>

        {product.categoryName ? (
          <span
            style={{
              fontSize: "0.75rem",
              color: "#2563eb",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {product.categoryName}
          </span>
        ) : null}

        <h3
          style={{
            margin: "5px 0 10px 0",
            fontSize: "1.1rem",
            color: "#0f172a",
            minHeight: "48px",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontSize: "1.4rem",
            fontWeight: "bold",
            color: "#0f172a",
            marginBottom: "20px",
            marginTop: 0,
          }}
        >
          {priceLabel} €
        </p>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!inStock || adding}
        style={{
          width: "100%",
          padding: "14px",
          backgroundColor: inStock ? "#0f172a" : "#f1f5f9",
          color: inStock ? "white" : "#94a3b8",
          border: "none",
          borderRadius: "12px",
          fontWeight: "bold",
          cursor: inStock && !adding ? "pointer" : "not-allowed",
          marginTop: "auto",
        }}
      >
        {adding ? "…" : inStock ? "Ajouter au panier" : "En rupture"}
      </button>
    </div>
  );
}
