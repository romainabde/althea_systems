"use client";

import Link from "next/link";

const actionsRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginTop: "1rem",
  alignItems: "center",
};

const primaryBtn = {
  display: "inline-block",
  padding: "0.75rem 1.25rem",
  background: "#003d5c",
  color: "#fff",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: "8px",
  border: "2px solid #003d5c",
};

const secondaryBtn = {
  display: "inline-block",
  padding: "0.75rem 1.25rem",
  background: "#fff",
  color: "#003d5c",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: "8px",
  border: "2px solid #003d5c",
};

/**
 * Liens connexion / inscription pour les invités (next = retour après login ou flux register→login).
 */
export default function GuestAccountPrompt({ description, nextPath = "/account" }) {
  const q = encodeURIComponent(nextPath);
  return (
    <>
      <p style={{ margin: 0 }}>{description}</p>
      <div style={actionsRow}>
        <Link href={`/login?next=${q}`} style={primaryBtn}>
          Se connecter
        </Link>
        <Link href={`/register?next=${q}`} style={secondaryBtn}>
          Créer un compte
        </Link>
      </div>
    </>
  );
}
