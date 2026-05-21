"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "../../../components/checkout/StripePaymentForm";
import { getPendingCheckoutOrder } from "../../../utils/checkoutSession";
import { useCheckoutAuthGate } from "../useCheckoutAuthGate";

const pageStyle = {
  padding: "1rem",
  maxWidth: "640px",
  margin: "0 auto",
};

const stripePublishableKey = (
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
).trim();

export default function CheckoutPaymentPage() {
  const gate = useCheckoutAuthGate();
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [ready, setReady] = useState(false);

  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    []
  );

  useEffect(() => {
    const p = getPendingCheckoutOrder();
    setPending(p);
    if (!p?.order?.id) {
      router.replace("/checkout/address");
    }
    setReady(true);
  }, [router]);

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
        <p style={{ margin: 0 }}>Chargement…</p>
      </section>
    );
  }

  if (!pending?.order) {
    return null;
  }

  const orderTotal =
    pending.order.totalAmount != null
      ? Number(pending.order.totalAmount)
      : null;

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Paiement sécurisé</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Commande n° <strong>{pending.order.id}</strong>
        {orderTotal != null ? (
          <>
            {" "}
            — montant à régler : <strong>{orderTotal.toFixed(2)} €</strong>
          </>
        ) : null}
        . Saisissez les informations de votre carte ci-dessous.
      </p>

      {!stripePublishableKey || !stripePromise ? (
        <p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>
          Clé Stripe manquante : définissez{" "}
          <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> dans{" "}
          <code>.env.local</code>, puis redémarrez le serveur Next.
        </p>
      ) : (
        <Elements stripe={stripePromise}>
          <StripePaymentForm pending={pending} />
        </Elements>
      )}
    </section>
  );
}
