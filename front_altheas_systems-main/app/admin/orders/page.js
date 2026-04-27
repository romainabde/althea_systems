"use client";

import Link from "next/link";
import { useState } from "react";

const pageStyle = { padding: "1rem", maxWidth: "900px", margin: "0 auto" };
const cardStyle = { border: "1px solid #ddd", borderRadius: "12px", padding: "1rem", marginTop: "1rem", background: "#fff" };
const buttonStyle = { padding: "0.45rem 0.7rem", border: "none", borderRadius: "8px", cursor: "pointer" };

const initialOrders = [
  { id: "CMD-1001", productName: "Scanner médical", date: "2026-04-20", amount: 1200, status: "En préparation" },
  { id: "CMD-1002", productName: "Moniteur patient", date: "2026-04-21", amount: 700, status: "Expédiée" },
  { id: "CMD-1003", productName: "Table d’examen", date: "2026-04-22", amount: 450, status: "Livrée" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);

  function handleDelete(id) {
    setOrders((prev) => prev.filter((item) => item.id !== id));
  }

  function handleEdit(order) {
    const nextStatus = window.prompt(
      "Nouveau statut (En préparation, Expédiée, Livrée, Annulée)",
      order.status
    );
    if (!nextStatus) return;
    setOrders((prev) =>
      prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus.trim() } : item))
    );
  }

  function handleAdd() {
    setOrders((prev) => [
      ...prev,
      {
        id: `CMD-${Math.floor(1000 + Math.random() * 9000)}`,
        productName: "Nouveau produit",
        date: "2026-04-23",
        amount: 500,
        status: "En préparation",
      },
    ]);
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Admin - Commandes</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Gestion front-only des commandes.</p>

      <button type="button" onClick={handleAdd} style={{ ...buttonStyle, background: "#003d5c", color: "#fff", marginTop: "0.5rem" }}>
        Ajouter une commande mock
      </button>

      <article style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Liste commandes</h2>
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "0.75rem" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{order.id}</p>
              <p style={{ margin: "0.3rem 0 0 0", color: "#444" }}>{order.productName}</p>
              <p style={{ margin: "0.3rem 0 0 0", color: "#444" }}>
                {order.date} - {order.amount} €
              </p>
              <p style={{ margin: "0.3rem 0 0 0", color: "#003d5c", fontWeight: 600 }}>Statut : {order.status}</p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.55rem" }}>
                <button type="button" onClick={() => handleEdit(order)} style={{ ...buttonStyle, background: "#2563eb", color: "#fff" }}>
                  Modifier
                </button>
                <button type="button" onClick={() => handleDelete(order.id)} style={{ ...buttonStyle, background: "#dc2626", color: "#fff" }}>
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
