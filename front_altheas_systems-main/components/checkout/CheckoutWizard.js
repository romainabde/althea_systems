"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCart } from "../../context/CartContext";
import { createAddress, fetchMyAddresses } from "../../services/api/addressesApi";
import {
  addPaymentMethod,
  fetchMyPaymentMethods,
} from "../../services/api/paymentsApi";
import { postCreateOrder, postPayOrder } from "../../services/api/checkoutApi";
import { getAuthUser } from "../../services/authSession";
import {
  clearPendingCheckoutOrder,
  setLastConfirmation,
  setPendingCheckoutOrder,
} from "../../utils/checkoutSession";
import CheckoutSummarySidebar from "./CheckoutSummarySidebar";
import { StripeCardFields } from "../stripe/StripeCardFields";
import {
  backBtnStyle,
  confirmBtnStyle,
  errorBoxStyle,
  inputStyle,
  mainCardStyle,
  nextBtnStyle,
  radioCardStyle,
  stepLabelStyle,
  stepperStyle,
} from "./checkoutStyles";

const EMPTY_ADDRESS = {
  firstName: "",
  lastName: "",
  street: "",
  city: "",
  region: "",
  zipCode: "",
  country: "France",
  phone: "",
};

function formatAddressLines(addr) {
  if (!addr) return "";
  const lines = [
    [addr.firstName, addr.lastName].filter(Boolean).join(" "),
    addr.street,
    [addr.zipCode, addr.city].filter(Boolean).join(" "),
    addr.region,
    addr.country,
    addr.phone ? `Tél : ${addr.phone}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

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

function countryToStripeCode(country) {
  const value = String(country || "").trim().toLowerCase();
  if (!value || value === "france" || value === "fr") return "FR";
  if (value.length === 2) return value.toUpperCase();
  return "FR";
}

function buildBillingDetails(address) {
  const authUser = getAuthUser();
  const name = [address?.firstName, address?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    name: name || undefined,
    email: authUser?.email || undefined,
    phone: address?.phone || undefined,
    address: {
      line1: address?.street || undefined,
      city: address?.city || undefined,
      postal_code: address?.zipCode || undefined,
      country: countryToStripeCode(address?.country),
    },
  };
}

export default function CheckoutWizard() {
  const router = useRouter();
  const { cart, cartTotalHT, refreshCart, loading: cartLoading } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedPayments, setSavedPayments] = useState([]);
  const [addressMode, setAddressMode] = useState("new");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [address, setAddress] = useState(EMPTY_ADDRESS);

  const [paymentMode, setPaymentMode] = useState("new");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [saveNewCard, setSaveNewCard] = useState(true);
  const [cardName, setCardName] = useState("");

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [pending, setPending] = useState(null);
  const [paymentSelection, setPaymentSelection] = useState(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const authUser = getAuthUser();

  useEffect(() => {
    if (checkoutComplete) return;
    if (!cartLoading && cart.length === 0 && step < 4) {
      router.replace("/cart");
    }
  }, [cart, cartLoading, router, step, checkoutComplete]);

  useEffect(() => {
    setCardName(authUser?.fullName || "");
  }, [authUser?.fullName]);

  const loadSavedData = useCallback(async () => {
    try {
      const [addresses, payments] = await Promise.all([
        fetchMyAddresses(),
        fetchMyPaymentMethods(),
      ]);
      setSavedAddresses(Array.isArray(addresses) ? addresses : []);
      setSavedPayments(Array.isArray(payments) ? payments : []);

      if (addresses?.length > 0) {
        setAddressMode("saved");
        setSelectedAddressId(addresses[0].id);
      }
      if (payments?.length > 0) {
        setPaymentMode("saved");
        setSelectedPaymentId(payments[0].id);
      }
    } catch {
      /* adresses / cartes optionnelles */
    }
  }, []);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  const handleCitySearch = async (text) => {
    setAddress((prev) => ({ ...prev, city: text }));
    if (text.length >= 2) {
      try {
        const res = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(text)}&fields=nom,codesPostaux,region&boost=population&limit=5`
        );
        const data = await res.json();
        setCitySuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch {
        setCitySuggestions([]);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectCity = (ville) => {
    setAddress((prev) => ({
      ...prev,
      city: ville.nom,
      zipCode: ville.codesPostaux?.[0] || prev.zipCode,
      region: ville.region?.nom || prev.region,
    }));
    setShowSuggestions(false);
  };

  const resolveAddressForOrder = async () => {
    if (addressMode === "saved" && selectedAddressId) {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!found) throw new Error("Adresse sélectionnée introuvable.");
      return found;
    }

    if (!/^\d{5}$/.test(address.zipCode)) {
      throw new Error("Le code postal doit contenir exactement 5 chiffres.");
    }
    const phoneClean = address.phone.replace(/\s/g, "");
    if (!/^\d{10}$/.test(phoneClean)) {
      throw new Error("Le numéro de téléphone doit contenir 10 chiffres valides.");
    }
    if (
      !address.firstName ||
      !address.lastName ||
      !address.street ||
      !address.city ||
      !address.country
    ) {
      throw new Error("Veuillez remplir tous les champs obligatoires.");
    }

    if (saveNewAddress || addressMode === "new") {
      const addrRes = await createAddress({
        firstName: address.firstName,
        lastName: address.lastName,
        street: address.street,
        city: address.city,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      });
      const created = addrRes?.address;
      if (!created?.id) {
        throw new Error("Impossible d'enregistrer l'adresse.");
      }
      return created;
    }

    throw new Error("Veuillez sélectionner ou saisir une adresse.");
  };

  const handleStep1Submit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsProcessing(true);
    try {
      const resolvedAddress = await resolveAddressForOrder();
      const orderRes = await postCreateOrder({ addressId: resolvedAddress.id });
      const order = orderRes?.order;
      if (!order?.id) {
        throw new Error("La commande n'a pas été créée.");
      }

      const payload = { order, address: resolvedAddress };
      setPending(payload);
      setPendingCheckoutOrder(payload);
      setStep(2);
    } catch (e) {
      setErrorMessage(e?.message || "Erreur lors de la livraison.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStep2Submit = async (event) => {
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
      setStep(3);
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
          billing_details: buildBillingDetails(pending?.address),
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
      setStep(3);
    } catch (e) {
      setErrorMessage(e?.message || "Erreur de paiement.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!pending?.order?.id || !paymentSelection?.stripePaymentMethodId) {
      setErrorMessage("Informations de commande incomplètes.");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);
    try {
      const orderTotal =
        pending.order.totalAmount != null
          ? Number(pending.order.totalAmount)
          : null;

      // Enregistrer la carte AVANT le paiement (Stripe exige attach au client avant usage)
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

      const result = await postPayOrder({
        orderId: pending.order.id,
        paymentMethodId: paymentSelection.stripePaymentMethodId,
      });

      setLastConfirmation({
        orderId: pending.order.id,
        transactionId: result?.transactionId || null,
        totalPaid: orderTotal,
      });
      clearPendingCheckoutOrder();
      setCheckoutComplete(true);
      await refreshCart();
      router.replace("/account");
    } catch (e) {
      setErrorMessage(e?.message || "Le paiement a échoué.");
      setIsProcessing(false);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    if (step === 2) {
      setPending(null);
      clearPendingCheckoutOrder();
    }
    if (step === 3) {
      setPaymentSelection(null);
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const selectedSavedAddress = savedAddresses.find(
    (a) => a.id === selectedAddressId
  );

  const orderTotal =
    pending?.order?.totalAmount != null
      ? Number(pending.order.totalAmount)
      : null;

  if (cartLoading) {
    return (
      <main
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "40px 20px",
          fontFamily: "'Inter', sans-serif",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        <p>Chargement du panier…</p>
      </main>
    );
  }

  if (cart.length === 0 && step < 4) return null;

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
          <div style={stepperStyle}>
            <span style={stepLabelStyle(step >= 1)}>1. Livraison</span>
            <span style={stepLabelStyle(step >= 2)}>2. Paiement</span>
            <span style={stepLabelStyle(step >= 3)}>3. Confirmation</span>
          </div>

          {errorMessage ? (
            <div style={errorBoxStyle}>⚠️ {errorMessage}</div>
          ) : null}

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <h2 style={{ marginBottom: "20px", color: "#003d5c" }}>
                Adresse de livraison
              </h2>

              {savedAddresses.length > 0 ? (
                <div style={{ marginBottom: "24px" }}>
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "0.95rem",
                    }}
                  >
                    Mes adresses enregistrées
                  </p>
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      style={radioCardStyle(
                        addressMode === "saved" && selectedAddressId === addr.id
                      )}
                    >
                      <input
                        type="radio"
                        name="addressChoice"
                        checked={
                          addressMode === "saved" &&
                          selectedAddressId === addr.id
                        }
                        onChange={() => {
                          setAddressMode("saved");
                          setSelectedAddressId(addr.id);
                        }}
                        style={{ marginTop: "4px" }}
                      />
                      <span style={{ color: "#475569", lineHeight: 1.5 }}>
                        <strong style={{ color: "#0f172a" }}>
                          {[addr.firstName, addr.lastName]
                            .filter(Boolean)
                            .join(" ")}
                        </strong>
                        <br />
                        {addr.street}
                        <br />
                        {addr.zipCode} {addr.city}
                        {addr.phone ? (
                          <>
                            <br />
                            Tél : {addr.phone}
                          </>
                        ) : null}
                      </span>
                    </label>
                  ))}

                  <label style={radioCardStyle(addressMode === "new")}>
                    <input
                      type="radio"
                      name="addressChoice"
                      checked={addressMode === "new"}
                      onChange={() => setAddressMode("new")}
                      style={{ marginTop: "4px" }}
                    />
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      Utiliser une nouvelle adresse
                    </span>
                  </label>
                </div>
              ) : null}

              {addressMode === "new" ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "15px",
                    }}
                  >
                    <input
                      required
                      type="text"
                      placeholder="Prénom"
                      value={address.firstName}
                      onChange={(e) =>
                        setAddress({ ...address, firstName: e.target.value })
                      }
                      style={inputStyle}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Nom"
                      value={address.lastName}
                      onChange={(e) =>
                        setAddress({ ...address, lastName: e.target.value })
                      }
                      style={inputStyle}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Adresse complète"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      style={{ ...inputStyle, gridColumn: "span 2" }}
                    />

                    <div style={{ position: "relative" }}>
                      <input
                        required
                        type="text"
                        placeholder="Ville (Tapez 2 lettres...)"
                        value={address.city}
                        onChange={(e) => handleCitySearch(e.target.value)}
                        style={inputStyle}
                      />
                      {showSuggestions && citySuggestions.length > 0 ? (
                        <ul
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "white",
                            border: "1px solid #cbd5e1",
                            borderRadius: "10px",
                            zIndex: 50,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            maxHeight: "200px",
                            overflowY: "auto",
                            padding: 0,
                            margin: "5px 0 0 0",
                            listStyle: "none",
                          }}
                        >
                          {citySuggestions.map((ville, index) => (
                            <li
                              key={`${ville.nom}-${index}`}
                              onClick={() => handleSelectCity(ville)}
                              style={{
                                padding: "12px 15px",
                                cursor: "pointer",
                                borderBottom:
                                  index !== citySuggestions.length - 1
                                    ? "1px solid #f1f5f9"
                                    : "none",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{ fontWeight: "bold", color: "#0f172a" }}
                              >
                                {ville.nom}
                              </span>
                              <span
                                style={{
                                  color: "#2563eb",
                                  fontSize: "0.9rem",
                                  backgroundColor: "#eff6ff",
                                  padding: "3px 8px",
                                  borderRadius: "20px",
                                }}
                              >
                                {ville.codesPostaux?.[0]}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <input
                      required
                      type="text"
                      placeholder="Code Postal"
                      maxLength={5}
                      value={address.zipCode}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          zipCode: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Région / Province"
                      value={address.region}
                      onChange={(e) =>
                        setAddress({ ...address, region: e.target.value })
                      }
                      style={inputStyle}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Pays"
                      value={address.country}
                      onChange={(e) =>
                        setAddress({ ...address, country: e.target.value })
                      }
                      style={inputStyle}
                    />
                    <input
                      required
                      type="tel"
                      placeholder="Téléphone (ex: 0612345678)"
                      maxLength={10}
                      value={address.phone}
                      onChange={(e) =>
                        setAddress({
                          ...address,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      style={{ ...inputStyle, gridColumn: "span 2" }}
                    />
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "16px",
                      fontSize: "0.95rem",
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                    />
                    Enregistrer cette adresse dans Mes adresses
                  </label>
                </>
              ) : null}

              <button
                type="submit"
                style={{
                  ...nextBtnStyle,
                  opacity: isProcessing ? 0.7 : 1,
                  cursor: isProcessing ? "not-allowed" : "pointer",
                }}
                disabled={isProcessing}
              >
                {isProcessing ? "Création de la commande…" : "Passer au paiement →"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <h2 style={{ marginBottom: "20px", color: "#003d5c" }}>
                Informations de paiement
              </h2>

              {savedPayments.length > 0 ? (
                <div style={{ marginBottom: "24px" }}>
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "0.95rem",
                    }}
                  >
                    Mes cartes enregistrées
                  </p>
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
                        {method.isDefault ? (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "0.8rem",
                              backgroundColor: "#dcfce7",
                              color: "#166534",
                              padding: "2px 8px",
                              borderRadius: "20px",
                            }}
                          >
                            Par défaut
                          </span>
                        ) : null}
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
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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

              <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <button type="button" onClick={handlePrevStep} style={backBtnStyle}>
                  ← Retour
                </button>
                <button
                  type="submit"
                  style={{
                    ...nextBtnStyle,
                    flex: 1,
                    marginTop: 0,
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Vérification…" : "Vérifier la commande →"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && pending ? (
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
                  {formatAddressLines(
                    addressMode === "saved" && selectedSavedAddress
                      ? selectedSavedAddress
                      : pending.address
                  )}
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
                    Montant : {(orderTotal * 1.2).toFixed(2)} € TTC
                  </p>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <button type="button" onClick={handlePrevStep} style={backBtnStyle}>
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
          ) : null}
        </div>

        <CheckoutSummarySidebar
          cart={cart}
          cartTotalHT={cartTotalHT}
          orderTotal={orderTotal}
        />
      </div>
    </main>
  );
}
