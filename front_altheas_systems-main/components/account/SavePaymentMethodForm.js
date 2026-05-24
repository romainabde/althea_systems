"use client";

import { useState } from "react";
import {
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { addPaymentMethod } from "../../services/api/paymentsApi";
import { getAuthUser } from "../../services/authSession";
import {
  accountInputStyle,
  accountLabelStyle,
  accountPrimaryBtn,
} from "./accountStyles";
import { StripeCardFields } from "../stripe/StripeCardFields";

/**
 * @param {{ onSaved?: () => void | Promise<void> }} props
 */
export default function SavePaymentMethodForm({ onSaved }) {
  const stripe = useStripe();
  const elements = useElements();
  const authUser = getAuthUser();
  const [cardName, setCardName] = useState(authUser?.fullName || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!stripe || !elements) {
      setError("Le formulaire n'est pas encore prêt. Réessayez.");
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
          billing_details: {
            name: cardName.trim() || authUser?.fullName || undefined,
            email: authUser?.email || undefined,
          },
        });

      if (stripeError) {
        setError(stripeError.message || "Carte refusée.");
        return;
      }

      if (!paymentMethod?.id) {
        setError("Impossible de valider la carte.");
        return;
      }

      await addPaymentMethod({
        paymentMethodId: paymentMethod.id,
        cardName: cardName.trim() || undefined,
      });

      elements.getElement(CardNumberElement)?.clear();
      setCardName(authUser?.fullName || "");
      if (onSaved) await onSaved();
    } catch (e) {
      setError(e?.message || "Impossible d'enregistrer la carte.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label style={{ ...accountLabelStyle, marginBottom: "14px" }}>
        Nom sur la carte
        <input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Ex. Jean Dupont"
          autoComplete="cc-name"
          style={accountInputStyle}
        />
      </label>

      <div
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "12px",
          padding: "16px",
          backgroundColor: "#f8fafc",
        }}
      >
        <StripeCardFields />
      </div>

      {error ? (
        <p style={{ marginTop: "12px", color: "#b91c1c", fontSize: "0.9rem" }}>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        style={{
          ...accountPrimaryBtn,
          width: "100%",
          marginTop: "18px",
          opacity: submitting || !stripe ? 0.7 : 1,
          cursor: submitting || !stripe ? "not-allowed" : "pointer",
        }}
        disabled={submitting || !stripe}
      >
        {submitting ? "Enregistrement…" : "Enregistrer la carte"}
      </button>
    </form>
  );
}
