"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { submitContactForm } from "../../services/api/contactApi";
import { getAuthUser } from "../../services/authSession";

const SUBJECT_PRESETS = [
  { value: "Problème technique", label: "Problème technique" },
  { value: "Question sur la commande", label: "Question sur la commande" },
  { value: "Assistance générale", label: "Assistance générale" },
];

const OTHER_VALUE = "__autre__";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [subjectMode, setSubjectMode] = useState(SUBJECT_PRESETS[0].value);
  const [subjectCustom, setSubjectCustom] = useState("");
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const u = getAuthUser();
    if (typeof u?.email === "string" && u.email.trim()) {
      setEmail(u.email.trim().toLowerCase());
    }
    if (typeof u?.fullName === "string" && u.fullName.trim()) {
      setFullName(u.fullName.trim());
    }
  }, []);

  function resolvedSubject() {
    if (subjectMode === OTHER_VALUE) {
      return subjectCustom.trim();
    }
    return subjectMode.trim();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const subject = resolvedSubject();
    if (!subject) {
      setError("Merci de préciser un sujet (ou choisissez « Autre » et complétez le champ libre).");
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitContactForm({
        email,
        subject,
        message,
        fullName: fullName.trim() ? fullName.trim() : undefined,
      });
      setSuccessMessage(
        typeof data?.message === "string"
          ? data.message
          : "Votre message a bien été envoyé. Notre équipe vous contactera sous peu.",
      );
      setMessage("");
      if (subjectMode === OTHER_VALUE) setSubjectCustom("");
    } catch (err) {
      setError(
        err?.message ??
          "Impossible d’envoyer le message. Vérifiez que support-service tourne (port 8081) et votre connexion réseau.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "560px",
        margin: "48px auto 80px",
        padding: "0 1rem",
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "0.35rem" }}>
        Nous contacter
      </h1>
      <p style={{ color: "#64748b", lineHeight: 1.55, marginBottom: "1.5rem" }}>
        Remplissez le formulaire ci-dessous. Vous pouvez aussi utiliser l’assistant en
        bas à droite sur le site. Les messages envoyés sont traités depuis l’espace{" "}
        <strong>admin</strong>.
      </p>

      <div
        style={{
          padding: "1.75rem",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
          border: "1px solid #e2e8f0",
        }}
      >
        {successMessage ? (
          <div
            role="status"
            style={{
              marginBottom: "1.25rem",
              padding: "1rem 1.1rem",
              borderRadius: "12px",
              background: "#ecfdf5",
              border: "1px solid #6ee7b7",
              color: "#065f46",
              lineHeight: 1.5,
            }}
          >
            {successMessage}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
        >
          {error ? (
            <p
              role="alert"
              style={{ color: "#b91c1c", fontSize: "0.95rem", margin: 0 }}
            >
              {error}
            </p>
          ) : null}

          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#334155" }}>
              Nom (optionnel)
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Prénom Nom"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#334155" }}>
              Adresse e-mail *
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="vous@exemple.com"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#334155" }}>
              Sujet du message *
            </span>
            <select
              required
              value={subjectMode}
              onChange={(e) => setSubjectMode(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {SUBJECT_PRESETS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
              <option value={OTHER_VALUE}>Autre…</option>
            </select>
          </label>

          {subjectMode === OTHER_VALUE ? (
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#334155" }}>
                Précisez votre sujet *
              </span>
              <input
                type="text"
                required
                value={subjectCustom}
                onChange={(e) => setSubjectCustom(e.target.value)}
                placeholder="Votre sujet"
                style={inputStyle}
              />
            </label>
          ) : null}

          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#334155" }}>
              Texte du message *
            </span>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre demande…"
              style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "0.25rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "10px",
              border: "none",
              background: submitting ? "#94a3b8" : "#003d5c",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Envoi…" : "Envoyer le message"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Link href="/" style={{ color: "#00a8b5", textDecoration: "none" }}>
          ← Retour à l’accueil
        </Link>
      </p>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.65rem 0.75rem",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "1rem",
};
