"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import GuestAccountPrompt from "../../../components/account/GuestAccountPrompt";
import { fetchMyOrders } from "../../../services/api/ordersApi";
import { getAuthToken } from "../../../services/authSession";

const pageStyle = {
  padding: "1rem",
  maxWidth: "760px",
  margin: "0 auto",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const STATUS_LABELS = {
  PENDING: "En attente de paiement",
  PAID: "Payée",
  CANCELLED: "Annulée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
};

function formatOrderStatus(status) {
  if (!status) return "—";
  return STATUS_LABELS[status] ?? status;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}

function summarizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) return "Aucun article";
  const names = items.map((i) => i.name || `Produit ${i.productId}`).join(", ");
  return names.length > 120 ? `${names.slice(0, 117)}…` : names;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      if (!getAuthToken()) {
        setOrders([]);
        setError("connect");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMyOrders();
        if (!cancelled) {
          setOrders(Array.isArray(data?.orders) ? data.orders : []);
        }
      } catch (e) {
        if (!cancelled) {
          if (e?.status === 401 || e?.status === 403) {
            setError("connect");
          } else {
            setError(e?.message || "Impossible de charger vos commandes.");
          }
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Mes commandes</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Historique des commandes enregistrées sur votre compte (auth-cart-service).
      </p>

      {loading ? (
        <article style={cardStyle}>
          <p style={{ margin: 0 }}>Chargement…</p>
        </article>
      ) : error === "connect" ? (
        <article style={cardStyle}>
          <GuestAccountPrompt
            description="Connectez-vous ou créez un compte pour voir vos commandes."
            nextPath="/account/orders"
          />
        </article>
      ) : error ? (
        <article style={{ ...cardStyle, borderColor: "#fca5a5" }}>
          <p style={{ margin: 0, color: "#b91c1c" }}>{error}</p>
        </article>
      ) : orders.length === 0 ? (
        <article style={cardStyle}>
          <p style={{ margin: 0 }}>Vous n&apos;avez pas encore de commande enregistrée.</p>
        </article>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          {orders.map((order) => (
            <article key={order.id} style={cardStyle}>
              <p style={{ margin: 0, fontWeight: 700 }}>
                Commande n°{order.id}
              </p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#555" }}>
                Date : {formatDate(order.createdAt)}
              </p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#111" }}>
                Montant total : {Number(order.totalAmount ?? 0).toLocaleString("fr-FR")} €
              </p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#003d5c", fontWeight: 600 }}>
                Statut : {formatOrderStatus(order.status)}
              </p>
              <p style={{ margin: "0.5rem 0 0 0", color: "#475569", fontSize: "0.92rem" }}>
                {summarizeItems(order.items)}
              </p>
            </article>
          ))}
        </div>
      )}

      <Link
        href="/account"
        style={{ display: "inline-block", marginTop: "1rem", color: "#003d5c", textDecoration: "none" }}
      >
        Retour au compte
      </Link>
    </section>
  );
}
