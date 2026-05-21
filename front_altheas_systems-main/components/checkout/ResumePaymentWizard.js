"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCart } from "../../context/CartContext";
import { postPayOrder } from "../../services/api/checkoutApi";
import { fetchOrderById } from "../../services/api/ordersApi";
import {
  addPaymentMethod,
  fetchMyPaymentMethods,
} from "../../services/api/paymentsApi";
import { getAuthUser } from "../../services/authSession";
import { setLastConfirmation } from "../../utils/checkoutSession";
import { amountHTToTTC, formatEuro } from "../../utils/pricing";
import {
  buildBillingDetails,
  formatAddressLines,
  formatBrand,
  formatExpiry,
} from "./checkoutHelpers";
import { StripeCardFields } from "../stripe/StripeCardFields";
import {
  backBtnStyle,
  confirmBtnStyle,
  errorBoxStyle,
  inputStyle,
  mainCardStyle,
  nextBtnStyle,
  radioCardStyle,
} from "./checkoutStyles";

function OrderSummaryPanel({ order }) {
  const subtotal = Number(order?.totalAmount ?? 0);
  const taxes = subtotal * 0.2;
  const finalTotal = subtotal + taxes;
  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        height: "fit-content",
      }}
    >
      <h2
        style={{
          fontSize: "1.3rem",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "15px",
          marginBottom: "20px",
          marginTop: 0,
        }}
      >
        Commande n°{order?.id}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "20px",
          maxHeight: "280px",
          overflowY: "auto",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id ?? `${item.productId}-${item.name}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
              gap: "12px",
            }}
          >
            <span style={{ color: "#475569" }}>
              {item.quantity}x {item.name}
            </span>
            <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
              {(Number(item.price) * item.quantity).toFixed(2)} €
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontSize: "0.95rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Sous-total HT</span>
          <span>{formatEuro(subtotal)} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>TVA (20%)</span>
          <span>{formatEuro(taxes)} €</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#0f172a",
          }}
        >
          <span>Total TTC</span>
          <span>{formatEuro(finalTotal)} €</span>
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{ orderId: number }} props
 */
export default function ResumePaymentWizard({ orderId }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { refreshCart } = useCart();
  const authUser = getAuthUser();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [savedPayments, setSavedPayments] = useState([]);
  const [paymentMode, setPaymentMode] = useState("new");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [saveNewCard, setSaveNewCard] = useState(true);
  const [cardName, setCardName] = useState("");
  const [paymentSelection, setPaymentSelection] = useState(null);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchOrderById(orderId);
      const row = data?.order;
      if (!row?.id) {
        throw new Error("Commande introuvable.");
      }
      if (row.status !== "PENDING") {
        throw new Error("Cette commande ne peut plus être payée.");
      }
      setOrder(row);
    } catch (e) {
      setLoadError(e?.message || "Impossible de charger la commande.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    setCardName(authUser?.fullName || "");
  }, [authUser?.fullName]);

  useEffect(() => {
    (async () => {
      try {
        const methods = await fetchMyPaymentMethods();
        const rows = Array.isArray(methods) ? methods : [];
        setSavedPayments(rows);
        if (rows.length > 0) {
          setPaymentMode("saved");
          setSelectedPaymentId(rows[0].id);
        }
      } catch {
        /* optionnel */
      }
    })();
  }, []);

  const handleStep1Submit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (paymentMode === "saved" && selectedPaymentId) {
      const saved = savedPayments.find((p) => p.id === selectedPaymentId);
      if (!saved?.stripePaymentMethodId) {
        setErrorMessage("Carte enregistrée invalide.");
        return;
      }
      setPaymentSelection({
        stripePaymentMethodId: saved.stripePaymentMethodId,
        label: `${formatBrand(saved.brand)} •••• ${saved.last4}`,
        isNew: false,
        saveCard: false,
        cardName: saved.cardName || "",
      });
      setStep(2);
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage("Le formulaire de paiement n'est pas prêt.");
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setErrorMessage("Formulaire carte indisponible.");
      return;
    }

    setIsProcessing(true);
    try {
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: buildBillingDetails(order?.address, authUser),
        });

      if (stripeError) {
        throw new Error(stripeError.message || "Carte refusée.");
      }
      if (!paymentMethod?.id) {
        throw new Error("Impossible de valider la carte.");
      }

      const brand = paymentMethod.card?.brand || "card";
      const last4 = paymentMethod.card?.last4 || "****";

      setPaymentSelection({
        stripePaymentMethodId: paymentMethod.id,
        label: `${formatBrand(brand)} •••• ${last4}`,
        isNew: true,
        saveCard: saveNewCard,
        cardName: cardName.trim() || authUser?.fullName || "",
      });
      setStep(2);
    } catch (e) {
      setErrorMessage(e?.message || "Erreur de paiement.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!order?.id || !paymentSelection?.stripePaymentMethodId) {
      setErrorMessage("Informations de paiement incomplètes.");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);
    try {
      if (
        paymentSelection.isNew &&
        paymentSelection.saveCard &&
        paymentSelection.stripePaymentMethodId
      ) {
        try {
          await addPaymentMethod({
            paymentMethodId: paymentSelection.stripePaymentMethodId,
            cardName: paymentSelection.cardName,
          });
        } catch (saveErr) {
          const msg = saveErr?.message || "";
          if (!msg.includes("déjà enregistrée")) {
            throw saveErr;
          }
        }
      }

      const orderTotal =
        order.totalAmount != null ? Number(order.totalAmount) : null;

      const result = await postPayOrder({
        orderId: order.id,
        paymentMethodId: paymentSelection.stripePaymentMethodId,
      });

      setLastConfirmation({
        orderId: order.id,
        transactionId: result?.transactionId || null,
        totalPaid: orderTotal,
      });
      await refreshCart();
      router.replace("/account");
    } catch (e) {
      setErrorMessage(e?.message || "Le paiement a échoué.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "60px 20px",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
          color: "#64748b",
        }}
      >
        <p>Chargement de la commande…</p>
      </main>
    );
  }

  if (loadError || !order) {
    return (
      <main
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "60px 20px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: "520px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#b91c1c", fontWeight: 600 }}>{loadError}</p>
          <Link
            href="/account/orders"
            style={{ color: "#003d5c", fontWeight: 600 }}
          >
            ← Retour à mes commandes
          </Link>
        </div>
      </main>
    );
  }

  const orderTotal =
    order.totalAmount != null ? Number(order.totalAmount) : null;

  return (
    <main
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "30px",
        }}
      >
        <div style={mainCardStyle}>
          <Link
            href="/account/orders"
            style={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            ← Mes commandes
          </Link>

          <h1
            style={{
              margin: "16px 0 8px 0",
              color: "#003d5c",
              fontSize: "1.75rem",
            }}
          >
            Finaliser le paiement
          </h1>
          <p style={{ margin: "0 0 24px 0", color: "#64748b" }}>
            Commande n° <strong>{order.id}</strong> — en attente de règlement
          </p>

          {errorMessage ? (
            <div style={errorBoxStyle}>⚠️ {errorMessage}</div>
          ) : null}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit}>
              <h2 style={{ marginBottom: "20px", color: "#003d5c" }}>
                Informations de paiement
              </h2>

              {savedPayments.length > 0 ? (
                <div style={{ marginBottom: "24px" }}>
                  {savedPayments.map((method) => (
                    <label
                      key={method.id}
                      style={radioCardStyle(
                        paymentMode === "saved" &&
                          selectedPaymentId === method.id
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentChoice"
                        checked={
                          paymentMode === "saved" &&
                          selectedPaymentId === method.id
                        }
                        onChange={() => {
                          setPaymentMode("saved");
                          setSelectedPaymentId(method.id);
                        }}
                        style={{ marginTop: "4px" }}
                      />
                      <span style={{ color: "#0f172a" }}>
                        <strong>
                          {formatBrand(method.brand)} •••• {method.last4}
                        </strong>
                        <span style={{ color: "#64748b", marginLeft: "8px" }}>
                          Exp. {formatExpiry(method.expMonth, method.expYear)}
                        </span>
                      </span>
                    </label>
                  ))}
                  <label style={radioCardStyle(paymentMode === "new")}>
                    <input
                      type="radio"
                      name="paymentChoice"
                      checked={paymentMode === "new"}
                      onChange={() => setPaymentMode("new")}
                      style={{ marginTop: "4px" }}
                    />
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      Utiliser une nouvelle carte
                    </span>
                  </label>
                </div>
              ) : null}

              {paymentMode === "new" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Nom sur la carte"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={inputStyle}
                  />
                  <div
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      padding: "16px",
                    }}
                  >
                    <StripeCardFields />
                  </div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "0.95rem",
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveNewCard}
                      onChange={(e) => setSaveNewCard(e.target.checked)}
                    />
                    Enregistrer cette carte dans Mes moyens de paiement
                  </label>
                </div>
              ) : null}

              <button
                type="submit"
                style={{
                  ...nextBtnStyle,
                  opacity: isProcessing ? 0.7 : 1,
                }}
                disabled={isProcessing}
              >
                {isProcessing ? "Vérification…" : "Vérifier la commande →"}
              </button>
            </form>
          ) : (
            <div>
              <h2 style={{ marginBottom: "20px", color: "#003d5c" }}>
                Vérification finale
              </h2>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
                  Livraison à :
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#475569",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {formatAddressLines(order.address)}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
                  Paiement :
                </h3>
                <p style={{ margin: 0, color: "#475569" }}>
                  {paymentSelection?.label || "—"}
                </p>
                {orderTotal != null ? (
                  <p
                    style={{
                      margin: "12px 0 0 0",
                      fontWeight: "bold",
                      color: "#0f172a",
                    }}
                  >
                    Montant : {formatEuro(amountHTToTTC(orderTotal))} € TTC
                  </p>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setPaymentSelection(null);
                    setStep(1);
                  }}
                  style={backBtnStyle}
                >
                  ← Modifier
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  style={{
                    ...confirmBtnStyle,
                    opacity: isProcessing ? 0.7 : 1,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  {isProcessing
                    ? "Validation en cours..."
                    : "Confirmer l'achat sécurisé"}
                </button>
              </div>
            </div>
          )}
        </div>

        <OrderSummaryPanel order={order} />
      </div>
    </main>
  );
}
