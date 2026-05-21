"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import GuestAccountPrompt from "../../components/account/GuestAccountPrompt";
import { getAuthToken, getAuthUser } from "../../services/authSession";
import {
  clearLastConfirmation,
  getLastConfirmation,
} from "../../utils/checkoutSession";
import { amountHTToTTC, formatEuro } from "../../utils/pricing";

const SECTIONS = [
  {
    href: "/account/orders",
    icon: "📦",
    title: "Mes commandes",
    description: "Suivez vos achats, statuts de livraison et historique.",
    accent: "#2563eb",
    accentBg: "#eff6ff",
  },
  {
    href: "/account/addresses",
    icon: "📍",
    title: "Mes adresses",
    description: "Gérez vos adresses de livraison et de facturation.",
    accent: "#0891b2",
    accentBg: "#ecfeff",
  },
  {
    href: "/account/payments",
    icon: "💳",
    title: "Mes cartes",
    description: "Enregistrez vos moyens de paiement pour un checkout rapide.",
    accent: "#7c3aed",
    accentBg: "#f5f3ff",
  },
  {
    href: "/account/settings",
    icon: "⚙️",
    title: "Paramètres",
    description: "Modifiez votre email, mot de passe et préférences.",
    accent: "#475569",
    accentBg: "#f1f5f9",
  },
];

function AccountNavCard({ section }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={section.href}
      style={{ textDecoration: "none", color: "inherit" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "28px",
          border: "1px solid #e2e8f0",
          boxShadow: hovered
            ? "0 20px 40px rgba(0,61,92,0.12)"
            : "0 4px 20px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: section.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            marginBottom: "18px",
          }}
        >
          {section.icon}
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            color: "#0f172a",
            fontWeight: 700,
          }}
        >
          {section.title}
        </h2>
        <p
          style={{
            margin: "10px 0 0 0",
            color: "#64748b",
            fontSize: "0.95rem",
            lineHeight: 1.55,
            flexGrow: 1,
          }}
        >
          {section.description}
        </p>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "20px",
            color: section.accent,
            fontWeight: 700,
            fontSize: "0.95rem",
          }}
        >
          Accéder
          <span style={{ fontSize: "1.1rem" }}>→</span>
        </span>
      </article>
    </Link>
  );
}

export default function AccountDashboardPage() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const authUser = getAuthUser();

  useEffect(() => {
    setLoggedIn(!!getAuthToken());
  }, [pathname]);

  useEffect(() => {
    const confirm = getLastConfirmation();
    if (confirm?.orderId) {
      const totalLabel =
        confirm.totalPaid != null && !Number.isNaN(Number(confirm.totalPaid))
          ? ` (${formatEuro(amountHTToTTC(confirm.totalPaid))} € TTC)`
          : "";
      setSuccessMessage(
        `Commande #${confirm.orderId} confirmée avec succès${totalLabel}.`
      );
      clearLastConfirmation();
    }
  }, []);

  const displayName =
    authUser?.fullName?.trim() ||
    authUser?.name?.trim() ||
    authUser?.email?.split("@")[0] ||
    "Client";

  if (!loggedIn) {
    return (
      <main
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "60px 20px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "#003d5c",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                margin: "0 auto 20px auto",
                boxShadow: "0 10px 30px rgba(0,61,92,0.25)",
              }}
            >
              👤
            </div>
            <h1
              style={{
                margin: "0 0 10px 0",
                fontSize: "2rem",
                color: "#0f172a",
              }}
            >
              Mon compte
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "1.05rem" }}>
              Connectez-vous pour accéder à votre espace personnel.
            </p>
          </div>

          <article
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            <GuestAccountPrompt
              description="Consultez vos commandes, adresses et moyens de paiement en vous connectant ou en créant un compte."
              nextPath="/account"
            />
          </article>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          background: "linear-gradient(135deg, #003d5c 0%, #0f172a 100%)",
          padding: "48px 20px 80px 20px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "0.9rem",
              opacity: 0.85,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Espace client
          </p>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
            }}
          >
            Bonjour, {displayName}
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "1.05rem" }}>
            Gérez vos commandes, adresses et moyens de paiement en un seul
            endroit.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1000px",
          margin: "-48px auto 0 auto",
          padding: "0 20px 60px 20px",
        }}
      >
        {successMessage ? (
          <article
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              boxShadow: "0 4px 20px rgba(22,163,74,0.1)",
            }}
          >
            <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>✅</span>
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                }}
              >
                Paiement réussi
              </p>
              <p style={{ margin: "6px 0 0 0", color: "#15803d" }}>
                {successMessage}
              </p>
              <Link
                href="/account/orders"
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  color: "#166534",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Voir ma commande →
              </Link>
            </div>
          </article>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {SECTIONS.map((section) => (
            <AccountNavCard key={section.href} section={section} />
          ))}
        </div>

        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            padding: "28px",
            backgroundColor: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p style={{ margin: "0 0 16px 0", color: "#64748b" }}>
            Besoin d&apos;équipement médical ?
          </p>
          <Link
            href="/products"
            style={{
              display: "inline-block",
              padding: "14px 28px",
              backgroundColor: "#003d5c",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(0,61,92,0.2)",
            }}
          >
            Parcourir le catalogue
          </Link>
        </div>
      </div>
    </main>
  );
}
