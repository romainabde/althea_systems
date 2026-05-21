"use client";

import { useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutWizard from "../../components/checkout/CheckoutWizard";
import { useCheckoutAuthGate } from "./useCheckoutAuthGate";

const stripePublishableKey = (
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
).trim();

export default function CheckoutPage() {
  const gate = useCheckoutAuthGate();

  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    []
  );

  if (gate === "checking") {
    return (
      <main
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "40px 20px",
          fontFamily: "'Inter', sans-serif",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <p style={{ margin: 0 }}>Vérification de la session…</p>
      </main>
    );
  }

  if (!stripePublishableKey || !stripePromise) {
    return (
      <main
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "40px 20px",
          fontFamily: "'Inter', sans-serif",
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ color: "#003d5c" }}>Checkout indisponible</h1>
        <p style={{ color: "#64748b" }}>
          Configurez <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> dans{" "}
          <code>.env.local</code>.
        </p>
      </main>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutWizard />
    </Elements>
  );
}
