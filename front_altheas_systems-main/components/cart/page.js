"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart, removeFromCart } from "../../utils/cart";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = getCart();
    console.log("Panier lu dans cart page :", storedCart);
    setCart(storedCart);
  }, []);

  const handleRemove = (productId) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  const total = cart.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Panier</h1>

      {cart.length === 0 ? (
        <div style={{ marginTop: "1rem" }}>
          <p>Votre panier est vide.</p>
          <Link
            href="/products"
            style={{
              marginTop: "0.5rem",
              display: "inline-block",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "#003d5c",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
            {cart.map((product) => (
              <div
                key={product.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "1rem",
                }}
              >
                <h3>{product.name}</h3>
                <p>Prix : {product.price} €</p>
                <p>Quantité : {product.quantity}</p>
                <p>Total produit : {product.price * product.quantity} €</p>

                <button
                  onClick={() => handleRemove(product.id)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    background: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "2rem" }}>Total : {total} €</h2>
          <Link
            href="/checkout"
            style={{
              marginTop: "1rem",
              display: "inline-block",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              background: "#003d5c",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Passer la commande
          </Link>
        </>
      )}
    </div>
  );
}