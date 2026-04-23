"use client";

import Link from "next/link";
import { useState } from "react";

const pageStyle = {
  padding: "1rem",
  maxWidth: "560px",
  margin: "0 auto",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
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

export default function AccountSettingsPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      setError("Email et mot de passe sont requis.");
      return;
    }

    if (!email.includes("@")) {
      setError("Veuillez saisir un email valide.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setMessage("Modifications enregistrées (mode front-only).");
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Paramètres du compte</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Mettez à jour vos informations de connexion.
      </p>

      <form onSubmit={handleSubmit} noValidate style={cardStyle}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          Email
          <input name="email" type="email" required defaultValue="user@althea.com" style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          Nouveau mot de passe
          <input name="password" type="password" required style={inputStyle} />
        </label>

        {error ? <p style={{ marginTop: "0.75rem", color: "#b91c1c" }}>{error}</p> : null}
        {message ? <p style={{ marginTop: "0.75rem", color: "#15803d" }}>{message}</p> : null}

        <button type="submit" style={buttonStyle}>
          Enregistrer
        </button>
      </form>

      <Link
        href="/account"
        style={{ display: "inline-block", marginTop: "1rem", color: "#003d5c", textDecoration: "none" }}
      >
        Retour au compte
      </Link>
    </section>
  );
}
