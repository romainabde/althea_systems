"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart } from "../../../services/cartService";
import { placeOrder, startCheckout } from "../../../services/checkoutService";
import { getCheckoutStateStore } from "../../../services/checkoutState";

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

export default function CheckoutReviewPage() {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], totals: { total: 0 } });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCart() {
      const data = await getCart();
      setCart(data);
    }
    loadCart();
  }, []);

  const total = useMemo(() => cart?.totals?.total || 0, [cart]);

  async function handleConfirm() {
    const checkoutState = getCheckoutStateStore();
    if (!checkoutState?.addressId) {
      setError("Adresse manquante. Veuillez revenir à l'étape adresse.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const checkoutResult = await startCheckout({
        addressId: checkoutState.addressId,
        email: checkoutState.email,
      });
      const orderId = checkoutResult?.order?.id;
      if (!orderId) {
        throw new Error("Order missing");
      }

      const paymentResult = await placeOrder({
        orderId,
        paymentMethodId: checkoutState.paymentMethodId || "pm_card_visa",
      });

      router.push(
        `/checkout/confirmation?orderId=${encodeURIComponent(orderId)}&tx=${encodeURIComponent(
          paymentResult?.transactionId || ""
        )}`
      );
    } catch (apiError) {
      setError("Impossible de confirmer la commande pour le moment.");
      setIsSubmitting(false);
    }
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Récapitulatif</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Vérifiez les informations avant de confirmer votre commande.
      </p>

      <article style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Produits du panier</h2>
        {cart.items.length === 0 ? (
          <p style={{ marginBottom: 0 }}>Votre panier est vide.</p>
        ) : (
          <>
            {cart.items.map((item) => (
              <div key={item.id} style={itemStyle}>
                <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                <p style={{ margin: "0.35rem 0 0 0", color: "#444" }}>
                  Quantité : {item.quantity}
                </p>
                <p style={{ margin: "0.2rem 0 0 0", color: "#444" }}>
                  Prix unitaire : {item.price} €
                </p>
                <p style={{ margin: "0.2rem 0 0 0", color: "#111", fontWeight: 600 }}>
                  Total ligne : {item.price * item.quantity} €
                </p>
              </div>
            ))}
            <p style={{ margin: "0.75rem 0 0 0", fontWeight: 700 }}>Total commande : {total} €</p>
          </>
        )}
      </article>

      <article style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Adresse de livraison</h2>
        <p style={{ margin: "0.35rem 0 0 0", color: "#444" }}>
          Jean Dupont, 10 Rue Exemple, 75000 Paris, France, +33 6 00 00 00 00
        </p>
      </article>

      <article style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Adresse de facturation</h2>
        <p style={{ margin: "0.35rem 0 0 0", color: "#444" }}>
          Identique à l’adresse de livraison
        </p>
      </article>

      <article style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Paiement</h2>
        <p style={{ margin: "0.35rem 0 0 0", color: "#444" }}>
          Carte bancaire se terminant par **** 4242
        </p>
      </article>

      {error ? <p style={{ color: "#b91c1c", marginTop: "0.75rem" }}>{error}</p> : null}

      <button
        onClick={handleConfirm}
        disabled={isSubmitting || cart.items.length === 0}
        style={{ ...actionLinkStyle, border: "none", cursor: "pointer" }}
      >
        {isSubmitting ? "Confirmation..." : "Confirmer la commande"}
      </button>
    </section>
  );
}
