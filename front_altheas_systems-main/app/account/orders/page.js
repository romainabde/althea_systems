"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AccountAlert,
  AccountEmptyState,
  AccountPageShell,
  StatusBadge,
  accountCardStyle,
  accountPrimaryBtn,
} from "../../../components/account/accountStyles";
import GuestAccountPrompt from "../../../components/account/GuestAccountPrompt";
import { fetchMyOrders } from "../../../services/api/ordersApi";
import { getAuthToken } from "../../../services/authSession";
import {
  clearLastConfirmation,
  getLastConfirmation,
} from "../../../utils/checkoutSession";
import { amountHTToTTC, formatEuro } from "../../../utils/pricing";

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
  const count = items.reduce((n, i) => n + (i.quantity || 1), 0);
  const names = items.map((i) => i.name || `Produit ${i.productId}`).join(", ");
  const short = names.length > 90 ? `${names.slice(0, 87)}…` : names;
  return `${count} article${count > 1 ? "s" : ""} · ${short}`;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const confirm = getLastConfirmation();
    if (confirm?.orderId) {
      const totalLabel =
        confirm.totalPaid != null && !Number.isNaN(Number(confirm.totalPaid))
          ? ` — ${formatEuro(amountHTToTTC(confirm.totalPaid))} € TTC`
          : "";
      setSuccessMessage(
        `Commande #${confirm.orderId} confirmée avec succès${totalLabel}.`
      );
      clearLastConfirmation();
    }
  }, []);

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

  if (error === "connect") {
    return (
      <AccountPageShell
        title="Mes commandes"
        subtitle="Historique de vos achats sur Althea Systems."
        icon="📦"
        accent="#2563eb"
      >
        <div style={{ ...accountCardStyle, padding: "32px" }}>
          <GuestAccountPrompt
            description="Connectez-vous ou créez un compte pour voir vos commandes."
            nextPath="/account/orders"
          />
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell
      title="Mes commandes"
      subtitle="Suivez le statut de vos commandes et finalisez les paiements en attente."
      icon="📦"
      accent="#2563eb"
    >
      {successMessage ? (
        <AccountAlert type="success">✅ {successMessage}</AccountAlert>
      ) : null}

      {loading ? (
        <div style={{ ...accountCardStyle, textAlign: "center", color: "#64748b" }}>
          Chargement de vos commandes…
        </div>
      ) : error ? (
        <AccountAlert type="error">{error}</AccountAlert>
      ) : orders.length === 0 ? (
        <AccountEmptyState
          icon="📦"
          title="Aucune commande"
          description="Vos futures commandes apparaîtront ici."
        />
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {orders.map((order) => (
            <article
              key={order.id}
              style={{
                ...accountCardStyle,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.82rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontWeight: 600,
                    }}
                  >
                    Commande
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    #{order.id}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                  padding: "14px 16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>
                    DATE
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "#334155" }}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>
                    TOTAL TTC
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "#003d5c",
                    }}
                  >
                    {formatEuro(amountHTToTTC(order.totalAmount))} €
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                    {formatEuro(order.totalAmount)} € HT
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem", lineHeight: 1.5 }}>
                {summarizeItems(order.items)}
              </p>

              {order.status === "PENDING" ? (
                <Link
                  href={`/account/orders/${order.id}/pay`}
                  style={{
                    ...accountPrimaryBtn,
                    display: "inline-block",
                    textAlign: "center",
                    textDecoration: "none",
                    alignSelf: "flex-start",
                  }}
                >
                  Finaliser le paiement →
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </AccountPageShell>
  );
}
