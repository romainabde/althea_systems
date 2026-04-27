"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCart } from "../../../utils/cart";

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
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Récapitulatif</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Vérifiez les informations avant de confirmer votre commande.
      </p>

      <article style={sectionStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Produits du panier</h2>
        {cart.length === 0 ? (
          <p style={{ marginBottom: 0 }}>Votre panier est vide.</p>
        ) : (
          <>
            {cart.map((item) => (
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

      <Link href="/checkout/confirmation" style={actionLinkStyle}>
        Confirmer la commande
      </Link>
    </section>
  );
}
