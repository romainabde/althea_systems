"use client";

/** Styles et petits composants partagés pour les pages compte. */

import Link from "next/link";

export const accountInputStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "0.95rem",
  boxSizing: "border-box",
  backgroundColor: "#fff",
  transition: "border-color 0.15s ease",
};

export const accountLabelStyle = {
  display: "grid",
  gap: "6px",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#334155",
};

export const accountPrimaryBtn = {
  padding: "12px 22px",
  border: "none",
  borderRadius: "10px",
  background: "#003d5c",
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.95rem",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(0,61,92,0.18)",
};

export const accountSecondaryBtn = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "2px solid #003d5c",
  background: "#fff",
  color: "#003d5c",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};

export const accountDangerBtn = {
  ...accountSecondaryBtn,
  borderColor: "#fecaca",
  backgroundColor: "#fef2f2",
  color: "#b91c1c",
};

export const accountCardStyle = {
  backgroundColor: "#fff",
  borderRadius: "16px",
  padding: "22px 24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 18px rgba(15,23,42,0.04)",
};

export const accountSectionTitleStyle = {
  margin: "0 0 6px 0",
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#0f172a",
};

export const STATUS_CONFIG = {
  PENDING: { label: "En attente de paiement", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  PAID: { label: "Payée", bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  CANCELLED: { label: "Annulée", bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  SHIPPED: { label: "Expédiée", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  DELIVERED: { label: "Livrée", bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status || "—",
    bg: "#f1f5f9",
    color: "#475569",
    dot: "#94a3b8",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 12px",
        borderRadius: "999px",
        fontSize: "0.82rem",
        fontWeight: 700,
        backgroundColor: cfg.bg,
        color: cfg.color,
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          backgroundColor: cfg.dot,
        }}
      />
      {cfg.label}
    </span>
  );
}

export function AccountAlert({ type = "info", children }) {
  const styles = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#166534" },
    error: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
    info: { bg: "#f8fafc", border: "#e2e8f0", color: "#475569" },
  };
  const s = styles[type] || styles.info;

  return (
    <div
      style={{
        ...accountCardStyle,
        backgroundColor: s.bg,
        borderColor: s.border,
        padding: "16px 20px",
        marginBottom: "20px",
      }}
    >
      <p style={{ margin: 0, color: s.color, fontWeight: type === "success" ? 600 : 500 }}>
        {children}
      </p>
    </div>
  );
}

export function AccountEmptyState({ icon, title, description }) {
  return (
    <div
      style={{
        ...accountCardStyle,
        textAlign: "center",
        padding: "48px 28px",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{icon}</div>
      <p style={{ margin: "0 0 8px 0", fontWeight: 700, color: "#0f172a", fontSize: "1.05rem" }}>
        {title}
      </p>
      {description ? (
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Enveloppe visuelle commune : fond gris clair, en-tête, lien retour.
 */
export function AccountPageShell({
  title,
  subtitle,
  icon,
  accent = "#003d5c",
  children,
  backHref = "/account",
}) {
  return (
    <main
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #0f172a 100%)`,
          padding: "36px 20px 64px 20px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <Link
            href={backHref}
            style={{
              color: "rgba(255,255,255,0.85)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            ← Mon compte
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px" }}>
            {icon ? (
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            ) : null}
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 800,
                }}
              >
                {title}
              </h1>
              {subtitle ? (
                <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "0.98rem" }}>
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "820px",
          margin: "-36px auto 0 auto",
          padding: "0 20px 60px 20px",
        }}
      >
        {children}
      </div>
    </main>
  );
}
