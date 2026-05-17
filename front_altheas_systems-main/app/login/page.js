"use client";

import { useState } from "react";
import Link from "next/link";
import { loginWithCredentials } from "../../services/api/authApi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await loginWithCredentials({
        email,
        password,
        rememberMe,
      });
      if (result.ok) {
        window.location.href = "/";
      } else {
        setError(result.message);
      }
    } catch {
      setError(
        "Impossible de joindre le serveur. Vérifiez que auth-cart-service tourne (port 8080)."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: "30px" }}>Connexion</h1>

      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "20px", textAlign: "center", lineHeight: 1.5 }}>
        Compte doit être confirmé (e-mail) avant la première connexion.
      </p>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {error ? (
          <p role="alert" style={{ color: "#b91c1c", fontSize: "0.95rem", margin: 0 }}>
            {error}
          </p>
        ) : null}

        <input
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.95rem", color: "#334155" }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Se souvenir de moi (session plus longue)
        </label>

        <button type="submit" disabled={submitting} style={btnStyle}>
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Nouveau client ?{" "}
        <Link href="/register" style={{ color: "#2563eb" }}>
          Créer un compte
        </Link>
      </p>
    </main>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "1rem",
};

const btnStyle = {
  backgroundColor: "#0f172a",
  color: "white",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
};
