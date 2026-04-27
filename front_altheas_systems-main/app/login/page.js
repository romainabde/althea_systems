"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { loginWithCredentials } from "../../services/api/authApi";

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = searchParams.get("next") || "/checkout/address";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const rememberMe = formData.get("rememberMe") === "on";

    if (!email || !password) {
      setError("Email et mot de passe sont requis.");
      return;
    }

    if (!email.includes("@")) {
      setError("Veuillez saisir un email valide.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginWithCredentials({ email, password, rememberMe });
      if (!result.ok) {
        setError(result.message || "Connexion impossible.");
        return;
      }
      router.push(nextPath);
    } catch {
      setError("Impossible de joindre le serveur. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Connexion</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Connectez-vous pour continuer votre commande.
      </p>

      <form onSubmit={handleSubmit} noValidate style={cardStyle}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          Email
          <input name="email" type="email" required style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          Mot de passe
          <input name="password" type="password" required style={inputStyle} />
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.75rem",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          <input name="rememberMe" type="checkbox" />
          Se souvenir de moi
        </label>

        {error ? <p style={{ marginTop: "0.75rem", color: "#b91c1c" }}>{error}</p> : null}

        <button
          type="submit"
          style={{
            ...buttonStyle,
            ...(submitting ? { opacity: 0.75, cursor: "wait" } : {}),
          }}
          disabled={submitting}
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", color: "#444" }}>
        Pas encore de compte ?{" "}
        <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>Créer un compte</Link>
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        <Link href={nextPath}>Continuer sans connexion</Link>
      </p>
    </section>
  );
}
