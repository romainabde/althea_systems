"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCart } from "../../context/CartContext";
import { postPayOrder } from "../../services/api/checkoutApi";
import { getAuthUser } from "../../services/authSession";
import {
  clearPendingCheckoutOrder,
  setLastConfirmation,
} from "../../utils/checkoutSession";

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.35rem",
  fontSize: "0.92rem",
  fontWeight: 500,
  color: "#222",
};

const fieldStyle = {
  padding: "0.75rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  background: "#fff",
};

const buttonStyle = {
  marginTop: "1rem",
  width: "100%",
  padding: "0.85rem 1rem",
  border: "none",
  borderRadius: "8px",
  background: "#003d5c",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const elementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#b91c1c" },
  },
};

function countryToStripeCode(country) {
  const value = String(country || "").trim().toLowerCase();
  if (!value || value === "france" || value === "fr") return "FR";
  if (value.length === 2) return value.toUpperCase();
  return "FR";
}

function buildBillingDetails(address) {
  const authUser = getAuthUser();
  const firstName = address?.firstName || "";
  const lastName = address?.lastName || "";
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    name: name || undefined,
    email: authUser?.email || undefined,
    phone: address?.phone || undefined,
    address: {
      line1: address?.street || undefined,
      city: address?.city || undefined,
      postal_code: address?.zipCode || undefined,
      country: countryToStripeCode(address?.country),
    },
  };
}

/**
 * @param {{ pending: { order: object; address?: object } }} props
 */
export default function StripePaymentForm({ pending }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { refreshCart } = useCart();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const orderTotal =
    pending?.order?.totalAmount != null
      ? Number(pending.order.totalAmount)
      : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!stripe || !elements) {
      setError("Le formulaire de paiement n’est pas encore prêt. Réessayez.");
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError("Formulaire carte indisponible.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: buildBillingDetails(pending.address),
        });

      if (stripeError) {
        setError(stripeError.message || "Carte refusée.");
        return;
      }

      if (!paymentMethod?.id) {
        setError("Impossible de valider la carte.");
        return;
      }

      const result = await postPayOrder({
        orderId: pending.order.id,
        paymentMethodId: paymentMethod.id,
      });

      setLastConfirmation({
        orderId: pending.order.id,
        transactionId: result?.transactionId || null,
        totalPaid: orderTotal,
      });
      clearPendingCheckoutOrder();
      await refreshCart();
      router.push("/checkout/confirmation");
    } catch (e) {
      setError(e?.message || "Le paiement a échoué.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <article style={cardStyle}>
        <p style={{ margin: "0 0 1rem 0", fontWeight: 600, color: "#0f172a" }}>
          Carte bancaire
        </p>

        <label style={labelStyle} htmlFor="card-number">
          Numéro de carte
        </label>
        <div id="card-number" style={{ ...fieldStyle, marginBottom: "1rem" }}>
          <CardNumberElement options={elementOptions} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label style={labelStyle} htmlFor="card-expiry">
              Date d&apos;expiration
            </label>
            <div id="card-expiry" style={fieldStyle}>
              <CardExpiryElement options={elementOptions} />
            </div>
          </div>
          <div>
            <label style={labelStyle} htmlFor="card-cvc">
              Cryptogramme (CVC)
            </label>
            <div id="card-cvc" style={fieldStyle}>
              <CardCvcElement options={elementOptions} />
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
          En test : <code>4242 4242 4242 4242</code>, date future, CVC{" "}
          <code>123</code>.
        </p>
      </article>

      {error ? (
        <p style={{ marginTop: "0.75rem", color: "#b91c1c", fontSize: "0.9rem" }}>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        style={{
          ...buttonStyle,
          opacity: submitting || !stripe ? 0.7 : 1,
          cursor: submitting || !stripe ? "not-allowed" : "pointer",
        }}
        disabled={submitting || !stripe}
      >
        {submitting
          ? "Paiement en cours…"
          : orderTotal != null
            ? `Payer ${orderTotal.toFixed(2)} € et finaliser`
            : "Payer et finaliser"}
      </button>
    </form>
  );
}
