"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { confirmEmailAndLogin } from "../../../services/api/authApi";

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

function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide : aucun jeton de confirmation.");
      return;
    }

    let cancelled = false;
    let redirectTimer;
    (async () => {
      const result = await confirmEmailAndLogin({ token, rememberMe: false });
      if (cancelled) return;
      if (!result.ok) {
        setStatus("error");
        setMessage(result.message || "Impossible de confirmer le compte.");
        return;
      }
      setStatus("ok");
      setMessage(
        typeof result.message === "string"
          ? result.message
          : "Votre compte est confirmé."
      );
      redirectTimer = setTimeout(() => {
        router.replace("/");
      }, 2000);
    })();

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <section style={pageStyle}>
        <h1 style={{ marginBottom: "0.35rem" }}>Confirmation du compte</h1>
        <p style={cardStyle}>Vérification du lien en cours…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section style={pageStyle}>
        <h1 style={{ marginBottom: "0.35rem" }}>Confirmation</h1>
        <p style={{ ...cardStyle, color: "#b91c1c" }}>{message}</p>
        <p style={{ marginTop: "1rem" }}>
          <Link href="/login">Se connecter</Link>
          {" · "}
          <Link href="/">Accueil</Link>
        </p>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Bienvenue</h1>
      <p style={cardStyle}>{message}</p>
      <p style={{ marginTop: "0.75rem", color: "#555" }}>
        Redirection vers l'accueil…
      </p>
    </section>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <section style={pageStyle}>
          <h1>Confirmation du compte</h1>
          <p>Chargement…</p>
        </section>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}
