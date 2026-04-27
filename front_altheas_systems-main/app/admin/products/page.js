"use client";

import Link from "next/link";
import { useState } from "react";

const pageStyle = { padding: "1rem", maxWidth: "900px", margin: "0 auto" };
const cardStyle = { border: "1px solid #ddd", borderRadius: "12px", padding: "1rem", marginTop: "1rem", background: "#fff" };
const inputStyle = { width: "100%", padding: "0.55rem 0.65rem", border: "1px solid #ccc", borderRadius: "8px" };
const buttonStyle = { padding: "0.45rem 0.7rem", border: "none", borderRadius: "8px", cursor: "pointer" };

const initialProducts = [
  { id: 101, name: "Scanner médical", price: 1200, stock: "En stock" },
  { id: 201, name: "Laser chirurgical", price: 950, stock: "Rupture" },
  { id: 301, name: "Moniteur patient", price: 700, stock: "En stock" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("En stock");

  function handleAddProduct(event) {
    event.preventDefault();
    if (!name.trim() || !price) return;

    setProducts((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), price: Number(price), stock },
    ]);
    setName("");
    setPrice("");
    setStock("En stock");
  }

  function handleDelete(id) {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  }

  function handleEdit(product) {
    const nextName = window.prompt("Nouveau nom du produit", product.name);
    if (!nextName) return;
    const nextPrice = window.prompt("Nouveau prix", String(product.price));
    if (!nextPrice) return;
    const nextStock = window.prompt("Nouveau statut (En stock ou Rupture)", product.stock);
    if (!nextStock) return;

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? { ...item, name: nextName.trim(), price: Number(nextPrice), stock: nextStock.trim() }
          : item
      )
    );
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Admin - Produits</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Gestion front-only des produits.</p>

      <form onSubmit={handleAddProduct} style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Ajouter un produit</h2>
        <div style={{ display: "grid", gap: "0.6rem" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom produit" style={inputStyle} />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Prix" type="number" style={inputStyle} />
          <select value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle}>
            <option>En stock</option>
            <option>Rupture</option>
          </select>
        </div>
        <button type="submit" style={{ ...buttonStyle, marginTop: "0.8rem", background: "#003d5c", color: "#fff" }}>
          Ajouter
        </button>
      </form>

      <article style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Liste produits</h2>
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "0.75rem" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{product.name}</p>
              <p style={{ margin: "0.3rem 0 0 0", color: "#444" }}>
                Prix : {product.price} € - Statut : {product.stock}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.55rem" }}>
                <button type="button" onClick={() => handleEdit(product)} style={{ ...buttonStyle, background: "#2563eb", color: "#fff" }}>
                  Modifier
                </button>
                <button type="button" onClick={() => handleDelete(product.id)} style={{ ...buttonStyle, background: "#dc2626", color: "#fff" }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <Link href="/admin" style={{ display: "inline-block", marginTop: "1rem", color: "#003d5c", textDecoration: "none" }}>
        Retour dashboard admin
      </Link>
    </section>
  );
}
