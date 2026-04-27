"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

const gridStyle = {
  display: "grid",
  gap: "0.75rem",
  marginTop: "0.75rem",
};

const labelStyle = {
  display: "grid",
  gap: "0.35rem",
  fontSize: "0.92rem",
  color: "#222",
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "0.95rem",
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

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const cardName = String(formData.get("cardName") || "").trim();
    const cardNumber = String(formData.get("cardNumber") || "").trim();
    const expiryDate = String(formData.get("expiryDate") || "").trim();
    const cvv = String(formData.get("cvv") || "").trim();

    if (!cardName || !cardNumber || !expiryDate || !cvv) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    router.push("/checkout/review");
  };

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Paiement</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Renseignez vos informations de paiement pour continuer.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <article style={cardStyle}>
          <div style={gridStyle}>
            <label style={labelStyle}>
              Nom sur la carte
              <input name="cardName" type="text" required style={inputStyle} />
            </label>

            <label style={labelStyle}>
              Numéro de carte
              <input
                name="cardNumber"
                type="text"
                inputMode="numeric"
                required
                style={inputStyle}
                placeholder="1234 5678 9012 3456"
              />
            </label>

            <label style={labelStyle}>
              Date d’expiration
              <input
                name="expiryDate"
                type="text"
                required
                style={inputStyle}
                placeholder="MM/AA"
              />
            </label>

            <label style={labelStyle}>
              CVV
              <input
                name="cvv"
                type="password"
                inputMode="numeric"
                required
                style={inputStyle}
                placeholder="123"
              />
            </label>
          </div>
        </article>

        {error ? (
          <p style={{ marginTop: "0.75rem", color: "#b91c1c", fontSize: "0.9rem" }}>{error}</p>
        ) : null}

        <button type="submit" style={buttonStyle}>
          Continuer vers le récapitulatif
        </button>
      </form>
    </section>
  );
}
