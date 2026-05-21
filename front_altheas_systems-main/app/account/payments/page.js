"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import {
  AccountAlert,
  AccountEmptyState,
  AccountPageShell,
  accountCardStyle,
  accountDangerBtn,
  accountSectionTitleStyle,
} from "../../../components/account/accountStyles";
import GuestAccountPrompt from "../../../components/account/GuestAccountPrompt";
import SavePaymentMethodForm from "../../../components/account/SavePaymentMethodForm";
import {
  deletePaymentMethod,
  fetchMyPaymentMethods,
} from "../../../services/api/paymentsApi";
import { getAuthToken } from "../../../services/authSession";

const stripePublishableKey = (
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
).trim();

function formatBrand(brand) {
  const value = String(brand || "carte").toLowerCase();
  if (value === "visa") return "Visa";
  if (value === "mastercard") return "Mastercard";
  if (value === "amex") return "American Express";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatExpiry(expMonth, expYear) {
  const month = String(expMonth || "").padStart(2, "0");
  const year = String(expYear || "");
  const shortYear = year.length >= 2 ? year.slice(-2) : year;
  return `${month}/${shortYear}`;
}

function brandGradient(brand) {
  const b = String(brand || "").toLowerCase();
  if (b === "visa") return "linear-gradient(135deg, #1a1f71 0%, #2d4aa8 100%)";
  if (b === "mastercard") return "linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)";
  if (b === "amex") return "linear-gradient(135deg, #006fcf 0%, #00a1e0 100%)";
  return "linear-gradient(135deg, #003d5c 0%, #0f172a 100%)";
}

export default function AccountPaymentsPage() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    []
  );

  const loadMethods = useCallback(async () => {
    setError("");
    try {
      const rows = await fetchMyPaymentMethods();
      setMethods(rows);
    } catch (e) {
      setError(e?.message || "Impossible de charger vos cartes.");
      setMethods([]);
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = !!getAuthToken();
    setLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadMethods();
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, loadMethods]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette carte de votre compte ?")) return;
    setDeletingId(id);
    setMessage("");
    setError("");
    try {
      await deletePaymentMethod(id);
      setMessage("Carte supprimée.");
      await loadMethods();
    } catch (e) {
      setError(e?.message || "Impossible de supprimer la carte.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = async () => {
    setMessage("Carte enregistrée.");
    setError("");
    await loadMethods();
  };

  if (!loggedIn) {
    return (
      <AccountPageShell
        title="Mes cartes"
        subtitle="Enregistrez vos moyens de paiement pour un checkout rapide."
        icon="💳"
        accent="#7c3aed"
      >
        <div style={{ ...accountCardStyle, padding: "32px" }}>
          <GuestAccountPrompt
            description="Connectez-vous ou créez un compte pour gérer vos cartes."
            nextPath="/account/payments"
          />
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell
      title="Mes cartes"
      subtitle="Vos cartes enregistrées pour simplifier vos prochains achats."
      icon="💳"
      accent="#7c3aed"
    >
      {message ? <AccountAlert type="success">{message}</AccountAlert> : null}
      {error && methods.length === 0 ? <AccountAlert type="error">{error}</AccountAlert> : null}
      {error && methods.length > 0 ? (
        <AccountAlert type="error">{error}</AccountAlert>
      ) : null}

      {loading ? (
        <div style={{ ...accountCardStyle, textAlign: "center", color: "#64748b" }}>
          Chargement…
        </div>
      ) : methods.length === 0 ? (
        <AccountEmptyState
          icon="💳"
          title="Aucune carte enregistrée"
          description="Ajoutez une carte pour payer plus rapidement lors de vos commandes."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {methods.map((pay) => (
            <article
              key={pay.id}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                backgroundColor: "#fff",
              }}
            >
              <div
                style={{
                  background: brandGradient(pay.brand),
                  padding: "22px 20px",
                  color: "white",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.85rem", opacity: 0.85, fontWeight: 600 }}>
                    {formatBrand(pay.brand)}
                  </span>
                  {pay.isDefault ? (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        padding: "3px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      Par défaut
                    </span>
                  ) : null}
                </div>
                <p
                  style={{
                    margin: "16px 0 0 0",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                  }}
                >
                  •••• •••• •••• {pay.last4}
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "0.82rem", opacity: 0.9 }}>
                  {pay.cardName || "Titulaire"} · Exp. {formatExpiry(pay.expMonth, pay.expYear)}
                </p>
              </div>
              <div style={{ padding: "14px 16px", borderTop: "1px solid #f1f5f9" }}>
                <button
                  type="button"
                  onClick={() => handleDelete(pay.id)}
                  disabled={deletingId === pay.id}
                  style={{
                    ...accountDangerBtn,
                    width: "100%",
                    opacity: deletingId === pay.id ? 0.5 : 1,
                  }}
                >
                  {deletingId === pay.id ? "Suppression…" : "Supprimer cette carte"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div style={accountCardStyle}>
        <h2 style={accountSectionTitleStyle}>Ajouter une carte</h2>
        <p style={{ margin: "0 0 18px 0", color: "#64748b", fontSize: "0.92rem" }}>
          Vos informations sont sécurisées via Stripe.
        </p>

        {!stripePublishableKey || !stripePromise ? (
          <AccountAlert type="error">
            Configuration paiement indisponible. Contactez le support si le problème persiste.
          </AccountAlert>
        ) : (
          <Elements stripe={stripePromise}>
            <SavePaymentMethodForm onSaved={handleSaved} />
          </Elements>
        )}
      </div>
    </AccountPageShell>
  );
}
