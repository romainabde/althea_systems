"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { registerWithCredentials } from "../../services/api/authApi";
import { getSafeInternalPath } from "../../utils/safeInternalPath";

function RegisterForm() {
  const searchParams = useSearchParams();
  const loginHref = useMemo(() => {
    const raw = searchParams.get("next");
    if (raw == null || raw === "") return "/login";
    const safe = getSafeInternalPath(raw);
    return `/login?next=${encodeURIComponent(safe)}`;
  }, [searchParams]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const result = await registerWithCredentials({
        fullName,
        email,
        password,
      });
      if (result.ok) {
        setSuccess(result.message);
        setPassword("");
      } else {
        setError(result.message);
      }
    } catch {
      setError("Impossible de joindre le serveur. Vérifiez que auth-cart-service tourne (port 8080).");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "450px",
        margin: "60px auto",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", marginBottom: "10px", color: "#0f172a" }}>
        Créer un compte
      </h1>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Rejoignez Althea Systems. Après inscription, confirmez votre adresse via le lien indiqué par le
        serveur (console du back ou e-mail si configuré).
      </p>

      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "24px", lineHeight: 1.5 }}>
        Le serveur exige un <strong>nom complet</strong> (prénom et nom, deux mots minimum) et un mot de
        passe d&apos;au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {error ? (
          <p role="alert" style={{ color: "#b91c1c", fontSize: "0.95rem", margin: 0 }}>
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" style={{ color: "#15803d", fontSize: "0.95rem", margin: 0 }}>
            {success}
          </p>
        ) : null}

        <input
          type="text"
          placeholder="Nom complet (ex. Jean Dupont)"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Adresse e-mail"
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
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" disabled={submitting} style={btnStyle}>
          {submitting ? "Envoi…" : "S'inscrire"}
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center", color: "#64748b" }}>
        Déjà inscrit ?{" "}
        <Link href={loginHref} style={{ color: "#2563eb", fontWeight: "bold" }}>
          Connectez-vous
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: "450px", margin: "60px auto", padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>
          Chargement…
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "1rem",
};

const btnStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  padding: "14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
};
