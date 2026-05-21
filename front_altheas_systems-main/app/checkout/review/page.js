"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import { fetchProductById, getProductDisplayName } from "../../../services/api/catalogApi";
import { useCheckoutAuthGate } from "../useCheckoutAuthGate";
import { getPendingCheckoutOrder } from "../../../utils/checkoutSession";

const pageStyle = {
  padding: "1rem",
  maxWidth: "700px",
  margin: "0 auto",
};

const sectionStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const itemStyle = {
  padding: "0.75rem 0",
  borderBottom: "1px solid #eee",
};

const actionLinkStyle = {
  marginTop: "1rem",
  display: "inline-flex",
  justifyContent: "center",
  width: "100%",
  padding: "0.85rem 1rem",
  borderRadius: "8px",
  background: "#003d5c",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
};

function formatAddress(a) {
  if (!a) return "—";
  const parts = [
    [a.firstName, a.lastName].filter(Boolean).join(" "),
    a.street,
    [a.zipCode, a.city].filter(Boolean).join(" "),
    a.country,
    a.phone ? `Tél. ${a.phone}` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

function resolveLineItems(pending, cart) {
  const orderItems = pending?.order?.items;
  if (Array.isArray(orderItems) && orderItems.length > 0) {
    return orderItems.map((row) => ({
      id: row.productId,
      productId: row.productId,
      name: row.name,
      price: Number(row.price ?? 0),
      quantity: Number(row.quantity ?? 1),
    }));
  }
  return cart;
}

function displayProductName(item, catalogNames) {
  const pid = String(item.productId ?? item.id ?? "");
  if (catalogNames[pid]) return catalogNames[pid];
  const name = String(item.name || "").trim();
  if (name && !/^Produit n°?\d+$/i.test(name)) return name;
  return name || `Produit ${pid}`;
}

export default function CheckoutReviewPage() {
  const gate = useCheckoutAuthGate();
  const router = useRouter();
  const { cart, loading: cartLoading } = useCart();
  const [pending, setPending] = useState(null);
  const [ready, setReady] = useState(false);
  const [catalogNames, setCatalogNames] = useState({});

  useEffect(() => {
    const p = getPendingCheckoutOrder();
    setPending(p);
    if (!p?.order?.id) {
      router.replace("/checkout/address");
    }
    setReady(true);
  }, [router]);

  const lineItems = useMemo(
    () => resolveLineItems(pending, cart),
    [pending, cart]
  );

  useEffect(() => {
    if (lineItems.length === 0) return;
    let cancelled = false;
    const ids = [
      ...new Set(
        lineItems.map((item) => String(item.productId ?? item.id)).filter(Boolean)
      ),
    ];

    (async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const product = await fetchProductById(id);
            const label = getProductDisplayName(product);
            return label ? [id, label] : null;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;
      const next = {};
      for (const entry of entries) {
        if (entry) next[entry[0]] = entry[1];
      }
      setCatalogNames(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [lineItems]);

  const orderTotal = pending?.order?.totalAmount;
  const addressBlock = pending?.address;

  const itemsTotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [lineItems]
  );

  if (gate === "checking" || cartLoading || !ready) {
    return (
      <section
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#64748b",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ margin: 0 }}>Chargement…</p>
      </section>
    );
  }

  if (!pending?.order) {
    return null;
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Récapitulatif</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Commande n° <strong>{pending.order.id}</strong> — vérifiez votre commande
        avant de continuer.
      </p>

      <article style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Panier</h2>
        {lineItems.length === 0 ? (
          <p style={{ marginBottom: 0 }}>Panier vide (erreur) — retournez au catalogue.</p>
        ) : (
          <>
            {lineItems.map((item) => (
              <div key={item.id} style={itemStyle}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {displayProductName(item, catalogNames)}
                </p>
                <p style={{ margin: "0.35rem 0 0 0", color: "#444" }}>
                  Quantité : {item.quantity}
                </p>
                <p style={{ margin: "0.2rem 0 0 0", color: "#444" }}>
                  Prix unitaire : {item.price} €
                </p>
                <p
                  style={{ margin: "0.2rem 0 0 0", color: "#111", fontWeight: 600 }}
                >
                  Total ligne : {item.price * item.quantity} €
                </p>
              </div>
            ))}
            <p style={{ margin: "0.75rem 0 0 0", fontWeight: 700, color: "#0f172a" }}>
              Total commande :{" "}
              {(orderTotal != null ? Number(orderTotal) : itemsTotal).toFixed(2)} € HT
            </p>
          </>
        )}
      </article>

      <article style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Livraison / facturation</h2>
        <p style={{ margin: "0.35rem 0 0 0", color: "#444", lineHeight: 1.5 }}>
          {formatAddress(addressBlock)}
        </p>
      </article>

      <Link href="/checkout/payment" style={actionLinkStyle}>
        Passer au paiement
      </Link>
    </section>
  );
}
