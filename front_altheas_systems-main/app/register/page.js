"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import {
  registerAccount,
  validateRegisterForm,
} from "../../services/registrationService";

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

const inputBaseStyle = {
  width: "100%",
  padding: "0.7rem 0.8rem",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#ccc",
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

const hintStyle = { fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" };

const errStyle = { fontSize: "0.85rem", color: "#b91c1c", marginTop: "0.35rem" };

function RegisterForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/checkout/address";

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormError("");
    setSuccessMessage("");

    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const local = validateRegisterForm({ fullName, email, password });
    if (!local.valid) {
      setFieldErrors(local.fieldErrors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const result = await registerAccount({
        fullName,
        email,
        password,
      });
      if (!result.ok) {
        setFormError(result.message || "Inscription impossible.");
        return;
      }
      setSuccessMessage(result.message);
      form.reset();
    } catch {
      setFormError("Impossible de joindre le serveur. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Inscription</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Créez un compte Althea Systems pour accéder aux produits et à votre
        espace.
      </p>

      <form onSubmit={handleSubmit} noValidate style={cardStyle}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          Nom complet (prénom et nom)
          <input
            name="fullName"
            type="text"
            autoComplete="name"
            required
            style={{
              ...inputBaseStyle,
              ...(fieldErrors.fullName ? { borderColor: "#b91c1c" } : {}),
            }}
            aria-invalid={!!fieldErrors.fullName}
            aria-describedby="hint-fullName"
          />
          <span id="hint-fullName" style={hintStyle}>
            Ex. : Marie Durand
          </span>
          {fieldErrors.fullName ? (
            <span style={errStyle} role="alert">
              {fieldErrors.fullName}
            </span>
          ) : null}
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          Adresse e-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            style={{
              ...inputBaseStyle,
              ...(fieldErrors.email ? { borderColor: "#b91c1c" } : {}),
            }}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email ? (
            <span style={errStyle} role="alert">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          Mot de passe
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            style={{
              ...inputBaseStyle,
              ...(fieldErrors.password ? { borderColor: "#b91c1c" } : {}),
            }}
            aria-invalid={!!fieldErrors.password}
            aria-describedby="hint-password"
          />
          <span id="hint-password" style={hintStyle}>
            Au moins 8 caractères : majuscule, minuscule, chiffre et caractère
            spécial.
          </span>
          {fieldErrors.password ? (
            <span style={errStyle} role="alert">
              {fieldErrors.password}
            </span>
          ) : null}
        </label>

        {formError ? (
          <p style={{ marginTop: "0.75rem", color: "#b91c1c" }} role="alert">
            {formError}
          </p>
        ) : null}

        {successMessage ? (
          <p
            style={{
              marginTop: "0.75rem",
              color: "#15803d",
              fontWeight: 600,
            }}
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          style={{
            ...buttonStyle,
            ...(submitting ? { opacity: 0.75, cursor: "wait" } : {}),
          }}
          disabled={submitting}
        >
          {submitting ? "Envoi…" : "Créer mon compte"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", color: "#444" }}>
        Déjà un compte ?{" "}
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
          Se connecter
        </Link>
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        <Link href={nextPath}>Continuer sans compte</Link>
      </p>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<section style={pageStyle}>Chargement…</section>}>
      <RegisterForm />
    </Suspense>
  );
}
