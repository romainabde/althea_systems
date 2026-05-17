"use client";

import { useState } from "react";
import Link from "next/link";

const pageStyle = {
  padding: "1rem",
  maxWidth: "640px",
  margin: "0 auto",
};

const sectionStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const formGridStyle = {
  display: "grid",
  gap: "0.75rem",
  marginTop: "0.75rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "0.95rem",
};

const labelStyle = {
  display: "grid",
  gap: "0.35rem",
  fontSize: "0.92rem",
  color: "#222",
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

function AddressFields({ prefix }) {
  return (
    <div style={formGridStyle}>
      <label style={labelStyle}>
        Prénom
        <input name={`${prefix}FirstName`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Nom
        <input name={`${prefix}LastName`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Adresse 1
        <input name={`${prefix}Address1`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Adresse 2
        <input name={`${prefix}Address2`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Ville
        <input name={`${prefix}City`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Région
        <input name={`${prefix}Region`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Code postal
        <input name={`${prefix}PostalCode`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Pays
        <input name={`${prefix}Country`} type="text" style={inputStyle} />
      </label>
      <label style={labelStyle}>
        Téléphone
        <input name={`${prefix}Phone`} type="tel" style={inputStyle} />
      </label>
    </div>
  );
}

export default function CheckoutAddressPage() {
  const [sameBillingAddress, setSameBillingAddress] = useState(true);

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Adresse</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Renseignez vos informations de livraison et de facturation.
      </p>

      <article style={sectionStyle}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Adresse de livraison</h2>
        <AddressFields prefix="shipping" />
      </article>

      <article style={sectionStyle}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem",
          }}
        >
          <input
            type="checkbox"
            checked={sameBillingAddress}
            onChange={(event) => setSameBillingAddress(event.target.checked)}
          />
          Adresse de facturation identique à l’adresse de livraison
        </label>
      </article>

      {!sameBillingAddress && (
        <article style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Adresse de facturation</h2>
          <AddressFields prefix="billing" />
        </article>
      )}

      <Link href="/checkout/payment" style={actionLinkStyle}>
        Continuer vers le paiement
      </Link>
    </section>
  );
}
