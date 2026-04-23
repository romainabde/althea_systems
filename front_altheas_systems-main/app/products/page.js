"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAllProducts } from "../../services/productService";

const pageStyle = {
  padding: "1rem",
  maxWidth: "960px",
  margin: "0 auto",
};

const controlsStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  background: "#fff",
  marginTop: "1rem",
};

const selectStyle = {
  width: "100%",
  maxWidth: "320px",
  padding: "0.7rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "0.95rem",
};

const productsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.9rem",
  marginTop: "1rem",
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("price_asc");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "availability") return Number(b.inStock) - Number(a.inStock);
      return 0;
    });
  }, [products, sort]);

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Catalogue produits</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Découvrez l’ensemble des produits disponibles.
      </p>

      <article style={controlsStyle}>
        <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.92rem" }}>
          Trier par
          <select value={sort} onChange={(event) => setSort(event.target.value)} style={selectStyle}>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="availability">Disponibilité</option>
          </select>
        </label>
      </article>

      {isLoading ? (
        <article style={{ ...controlsStyle, marginTop: "1rem" }}>
          <p style={{ margin: 0 }}>Chargement des produits...</p>
        </article>
      ) : (
        <div style={productsGridStyle}>
          {sortedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "0.9rem",
                textDecoration: "none",
                color: "#111",
                background: product.inStock ? "#fff" : "#f8f8f8",
                opacity: product.inStock ? 1 : 0.75,
              }}
            >
              <p style={{ margin: 0, fontWeight: 700 }}>{product.name}</p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#555" }}>{product.category}</p>
              <p style={{ margin: "0.35rem 0 0 0" }}>{product.price} €</p>
              <p
                style={{
                  margin: "0.35rem 0 0 0",
                  color: product.inStock ? "#15803d" : "#b91c1c",
                  fontWeight: 600,
                }}
              >
                {product.inStock ? "En stock" : "Rupture de stock"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
