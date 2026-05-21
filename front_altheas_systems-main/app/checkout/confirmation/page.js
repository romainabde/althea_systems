"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCheckoutAuthGate } from "../useCheckoutAuthGate";
import { getLastConfirmation } from "../../../utils/checkoutSession";

export default function CheckoutConfirmationPage() {
  const gate = useCheckoutAuthGate();
  const [confirm, setConfirm] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConfirm(getLastConfirmation());
    setReady(true);
    window.scrollTo(0, 0);
  }, []);

  if (gate === "checking" || !ready) {
    return (
      <main
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#64748b",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <p style={{ margin: 0 }}>Vérification de la session…</p>
      </main>
    );
  }

  if (!confirm?.orderId) {
    return (
      <main
        style={{
          maxWidth: "800px",
          margin: "80px auto",
          padding: "40px",
          fontFamily: "'Inter', sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#0f172a" }}>Aucune commande à afficher</h1>
        <p style={{ color: "#64748b" }}>
          Retournez au catalogue ou au panier pour passer une commande.
        </p>
        <Link href="/">
          <button
            style={{
              padding: "16px 30px",
              backgroundColor: "#003d5c",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Retour à l&apos;accueil
          </button>
        </Link>
      </main>
    );
  }

  const totalLabel =
    confirm.totalPaid != null && !Number.isNaN(Number(confirm.totalPaid))
      ? `${(Number(confirm.totalPaid) * 1.2).toFixed(2)} € TTC`
      : "—";

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "80px auto",
        padding: "40px",
        fontFamily: "'Inter', sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#f0fdf4",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 30px auto",
          border: "2px solid #bbf7d0",
        }}
      >
        <span style={{ fontSize: "3rem" }}>✅</span>
      </div>

      <h1
        style={{
          fontSize: "2.5rem",
          color: "#0f172a",
          marginBottom: "15px",
        }}
      >
        Commande confirmée !
      </h1>
      <p
        style={{
          color: "#64748b",
          fontSize: "1.2rem",
          marginBottom: "40px",
        }}
      >
        Merci pour votre confiance. Votre commande{" "}
        <strong>#{confirm.orderId}</strong> est en cours de préparation par nos
        équipes logistiques.
      </p>

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          padding: "30px",
          textAlign: "left",
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          marginBottom: "40px",
        }}
      >
        <h3
          style={{
            margin: "0 0 20px 0",
            fontSize: "1.1rem",
            color: "#0f172a",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "15px",
          }}
        >
          Détails de l&apos;expédition
        </h3>
        <p style={{ color: "#475569", margin: "0 0 10px 0" }}>
          📦 <strong>Mode :</strong> Transporteur spécialisé matériel médical
        </p>
        <p style={{ color: "#475569", margin: "0 0 10px 0" }}>
          📅 <strong>Délai estimé :</strong> 3 à 5 jours ouvrés
        </p>
        <p style={{ color: "#475569", margin: "0 0 10px 0" }}>
          💳 <strong>Montant réglé :</strong> {totalLabel}
        </p>
        <p style={{ color: "#475569", margin: 0 }}>
          📧 Un email récapitulatif a été envoyé à votre adresse professionnelle.
        </p>
        {confirm.transactionId ? (
          <p
            style={{
              color: "#94a3b8",
              margin: "12px 0 0 0",
              fontSize: "0.85rem",
              wordBreak: "break-all",
            }}
          >
            Réf. Stripe : {confirm.transactionId}
          </p>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/account/orders">
          <button
            style={{
              padding: "16px 30px",
              backgroundColor: "white",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            Suivre ma commande
          </button>
        </Link>
        <Link href="/">
          <button
            style={{
              padding: "16px 30px",
              backgroundColor: "#003d5c",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(0,61,92,0.2)",
            }}
          >
            Retour à l&apos;accueil
          </button>
        </Link>
      </div>
    </main>
  );
}
