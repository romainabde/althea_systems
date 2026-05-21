"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCheckoutAuthGate } from "../useCheckoutAuthGate";
import { getLastConfirmation } from "../../../utils/checkoutSession";

const pageStyle = {
  padding: "1rem",
  maxWidth: "640px",
  margin: "0 auto",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const primaryButtonStyle = {
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

const secondaryButtonStyle = {
  marginTop: "0.75rem",
  display: "inline-flex",
  justifyContent: "center",
  width: "100%",
  padding: "0.85rem 1rem",
  borderRadius: "8px",
  border: "1px solid #003d5c",
  background: "#fff",
  color: "#003d5c",
  textDecoration: "none",
  fontWeight: 600,
};

export default function CheckoutConfirmationPage() {
  const gate = useCheckoutAuthGate();
  const [confirm, setConfirm] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConfirm(getLastConfirmation());
    setReady(true);
  }, []);

  if (gate === "checking" || !ready) {
    return (
      <section
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#64748b",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ margin: 0 }}>Vérification de la session…</p>
      </section>
    );
  }

  if (!confirm?.orderId) {
    return (
      <section style={pageStyle}>
        <h1 style={{ marginBottom: "0.35rem" }}>Aucune commande à afficher</h1>
        <p style={{ marginTop: 0, color: "#555" }}>
          Cette page affiche la dernière commande confirmée dans cette session. Si
          vous venez d’arriver ici directement, retournez au catalogue ou au panier.
        </p>
        <Link href="/" style={primaryButtonStyle}>
          Retour à l’accueil
        </Link>
      </section>
    );
  }

  const totalLabel =
    confirm.totalPaid != null && !Number.isNaN(Number(confirm.totalPaid))
      ? `${Number(confirm.totalPaid).toFixed(2)} €`
      : "—";

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Commande confirmée</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Merci pour votre achat. Votre commande a bien été prise en compte.
      </p>

      <article style={cardStyle}>
        <p style={{ margin: 0, fontWeight: 700 }}>Numéro de commande</p>
        <p style={{ margin: "0.35rem 0 0 0", fontSize: "1.05rem" }}>{confirm.orderId}</p>
      </article>

      <article style={cardStyle}>
        <p style={{ margin: 0, fontWeight: 700 }}>Paiement Stripe</p>
        <p style={{ margin: "0.35rem 0 0 0", color: "#444", wordBreak: "break-all" }}>
          Transaction : {confirm.transactionId || "—"}
        </p>
      </article>

      <article style={cardStyle}>
        <p style={{ margin: 0, fontWeight: 700 }}>Résumé</p>
        <p style={{ margin: "0.35rem 0 0 0", color: "#444" }}>Total : {totalLabel}</p>
      </article>

      <Link href="/" style={primaryButtonStyle}>
        Retour à l’accueil
      </Link>

      <Link href="/account" style={secondaryButtonStyle}>
        Aller à mon compte
      </Link>
    </section>
  );
}
