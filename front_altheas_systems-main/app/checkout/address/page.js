"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutAuthGate } from "../useCheckoutAuthGate";
import { createAddress } from "../../../services/api/addressesApi";
import { postCreateOrder } from "../../../services/api/checkoutApi";
import { setPendingCheckoutOrder } from "../../../utils/checkoutSession";

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

const buttonStyle = {
  marginTop: "1rem",
  width: "100%",
  padding: "0.85rem 1rem",
  borderRadius: "8px",
  border: "none",
  background: "#003d5c",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

function AddressFields({ prefix }) {
  return (
    <div style={formGridStyle}>
      <label style={labelStyle}>
        Prénom
        <input
          name={`${prefix}FirstName`}
          type="text"
          required
          autoComplete="given-name"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Nom
        <input
          name={`${prefix}LastName`}
          type="text"
          required
          autoComplete="family-name"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Adresse (ligne 1)
        <input
          name={`${prefix}Address1`}
          type="text"
          required
          autoComplete="street-address"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Adresse (ligne 2) — optionnel
        <input
          name={`${prefix}Address2`}
          type="text"
          autoComplete="address-line2"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Ville
        <input
          name={`${prefix}City`}
          type="text"
          required
          autoComplete="address-level2"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Code postal
        <input
          name={`${prefix}PostalCode`}
          type="text"
          required
          autoComplete="postal-code"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Pays
        <input
          name={`${prefix}Country`}
          type="text"
          required
          autoComplete="country-name"
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Téléphone
        <input
          name={`${prefix}Phone`}
          type="tel"
          required
          autoComplete="tel"
          style={inputStyle}
        />
      </label>
    </div>
  );
}

function buildStreet(fd, prefix) {
  const a1 = String(fd.get(`${prefix}Address1`) || "").trim();
  const a2 = String(fd.get(`${prefix}Address2`) || "").trim();
  if (!a1) return "";
  return a2 ? `${a1}, ${a2}` : a1;
}

export default function CheckoutAddressPage() {
  const gate = useCheckoutAuthGate();
  const router = useRouter();
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData(event.currentTarget);

      const shippingPayload = {
        firstName: String(fd.get("shippingFirstName") || "").trim(),
        lastName: String(fd.get("shippingLastName") || "").trim(),
        street: buildStreet(fd, "shipping"),
        city: String(fd.get("shippingCity") || "").trim(),
        zipCode: String(fd.get("shippingPostalCode") || "").trim(),
        country: String(fd.get("shippingCountry") || "").trim(),
        phone: String(fd.get("shippingPhone") || "").trim(),
      };

      if (!shippingPayload.street) {
        throw new Error("L’adresse (ligne 1) est obligatoire.");
      }

      let addressPayload = shippingPayload;
      if (!sameBillingAddress) {
        addressPayload = {
          firstName: String(fd.get("billingFirstName") || "").trim(),
          lastName: String(fd.get("billingLastName") || "").trim(),
          street: buildStreet(fd, "billing"),
          city: String(fd.get("billingCity") || "").trim(),
          zipCode: String(fd.get("billingPostalCode") || "").trim(),
          country: String(fd.get("billingCountry") || "").trim(),
          phone: String(fd.get("billingPhone") || "").trim(),
        };
        if (!addressPayload.street) {
          throw new Error("L’adresse de facturation (ligne 1) est obligatoire.");
        }
      }

      const addrRes = await createAddress(addressPayload);
      const address = addrRes?.address;
      const addressId = address?.id;
      if (addressId == null) {
        throw new Error(
          "Réponse adresse invalide. Vérifie auth-cart-service (8080)."
        );
      }

      const orderRes = await postCreateOrder({ addressId });
      const order = orderRes?.order;
      if (order?.id == null) {
        throw new Error(
          "La commande n’a pas été créée. Panier vide ou erreur serveur."
        );
      }

      setPendingCheckoutOrder({
        order,
        address,
        billingSameAsShipping: sameBillingAddress,
      });

      router.push("/checkout/review");
    } catch (e) {
      setError(
        e?.message ||
          "Impossible d’enregistrer l’adresse ou de créer la commande."
      );
    } finally {
      setLoading(false);
    }
  }

  if (gate === "checking") {
    return (
      <section
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#64748b",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ margin: 0 }}>Vérification de la session…</p>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Adresse</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Renseignez l’adresse de livraison. La commande sera créée ensuite en
        attente de paiement.
      </p>

      <form onSubmit={handleSubmit} noValidate>
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
              onChange={(event) =>
                setSameBillingAddress(event.target.checked)
              }
            />
            Adresse de facturation identique à l’adresse de livraison
          </label>
        </article>

        {!sameBillingAddress && (
          <article style={sectionStyle}>
            <h2 style={{ margin: 0, fontSize: "1rem" }}>
              Adresse de facturation
            </h2>
            <AddressFields prefix="billing" />
          </article>
        )}

        {error && (
          <p
            style={{
              marginTop: "1rem",
              color: "#b91c1c",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </p>
        )}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Enregistrement…" : "Créer la commande et continuer"}
        </button>
      </form>
    </section>
  );
}
