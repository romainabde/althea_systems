"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { registerUser } from "../../services/authService";

const pageStyle = {
  padding: "1rem",
  maxWidth: "480px",
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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const nextPath = searchParams.get("next") || "/checkout/address";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!fullName || !email || !password) {
      setError("Nom complet, email et mot de passe sont requis.");
      return;
    }

    if (!email.includes("@")) {
      setError("Veuillez saisir un email valide.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      await registerUser({ fullName, email, password });
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    } catch (apiError) {
      setError("Inscription impossible pour le moment.");
    }
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Inscription</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Créez un compte pour continuer votre commande.
      </p>

      <form onSubmit={handleSubmit} noValidate style={cardStyle}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          Nom complet
          <input name="fullName" type="text" required style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: "0.35rem" }}>
          Email
          <input name="email" type="email" required style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          Mot de passe
          <input name="password" type="password" required style={inputStyle} />
        </label>

        {error ? <p style={{ marginTop: "0.75rem", color: "#b91c1c" }}>{error}</p> : null}

        <button type="submit" style={buttonStyle}>
          Créer un compte
        </button>
      </form>

      <p style={{ marginTop: "1rem", color: "#444" }}>
        Déjà un compte ? <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Se connecter</Link>
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        <Link href={nextPath}>Continuer sans connexion</Link>
      </p>
    </section>
  );
}
