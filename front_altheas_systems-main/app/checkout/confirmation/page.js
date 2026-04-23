"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

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

function buildMockOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ALTHEA-${stamp}-${randomPart}`;
}

export default function CheckoutConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = useMemo(() => buildMockOrderNumber(), []);
  const orderId = searchParams.get("orderId");
  const transactionId = searchParams.get("tx");

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Commande confirmée</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Merci pour votre achat. Votre commande a bien été prise en compte.
      </p>

      <article style={cardStyle}>
        <p style={{ margin: 0, fontWeight: 700 }}>Numéro de commande</p>
        <p style={{ margin: "0.35rem 0 0 0", fontSize: "1.05rem" }}>{orderId || orderNumber}</p>
      </article>

      <article style={cardStyle}>
        <p style={{ margin: 0, fontWeight: 700 }}>Paiement</p>
        <p style={{ margin: "0.35rem 0 0 0", color: "#444" }}>
          Transaction : {transactionId || "En cours de validation"}
        </p>
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
