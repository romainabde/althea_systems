"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ResumePaymentWizard from "../../../../../components/checkout/ResumePaymentWizard";
import GuestAccountPrompt from "../../../../../components/account/GuestAccountPrompt";
import { getAuthToken } from "../../../../../services/authSession";

const stripePublishableKey = (
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
).trim();

export default function ResumePaymentPage() {
  const params = useParams();
  const orderId = Number(params?.orderId);

  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    []
  );

  if (!getAuthToken()) {
    const nextPath =
      Number.isFinite(orderId) && orderId > 0
        ? `/account/orders/${orderId}/pay`
        : "/account/orders";

    return (
      <main
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "60px 20px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <article
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #e2e8f0",
            }}
          >
            <GuestAccountPrompt
              description="Connectez-vous pour finaliser le paiement de votre commande."
              nextPath={nextPath}
            />
          </article>
        </div>
      </main>
    );
  }

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return (
      <main
        style={{
          padding: "60px 20px",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <p>Identifiant de commande invalide.</p>
      </main>
    );
  }

  if (!stripePublishableKey || !stripePromise) {
    return (
      <main
        style={{
          padding: "60px 20px",
          maxWidth: "640px",
          margin: "0 auto",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <h1 style={{ color: "#003d5c" }}>Paiement indisponible</h1>
        <p style={{ color: "#64748b" }}>
          Configurez <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> dans{" "}
          <code>.env.local</code>.
        </p>
      </main>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <ResumePaymentWizard orderId={orderId} />
    </Elements>
  );
}
