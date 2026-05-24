"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200";

function isItemUnavailable(item) {
  return item.inStock === false || (item.stockQuantity ?? 1) <= 0;
}

export default function CartPage() {
  const {
    cart,
    loading,
    cartError,
    removeFromCart,
    updateQuantity,
    cartTotalHT,
    clearCart,
    isLoggedIn,
  } = useCart();

  const hasUnavailableItems = cart.some(isItemUnavailable);

  const subtotalHT = cart.reduce((total, item) => {
    if (isItemUnavailable(item)) return total;
    return total + item.price * item.quantity;
  }, 0);

  const totalHT = cartTotalHT > 0 ? cartTotalHT : subtotalHT;
  const tva = totalHT * 0.2;
  const totalTTC = totalHT + tva;

  if (loading && cart.length === 0) {
    return (
      <main
        style={{
          padding: "100px 20px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ color: "#64748b" }}>Chargement du panier…</p>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main
        style={{
          maxWidth: "1200px",
          margin: "60px auto",
          padding: "0 20px",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "80px 24px",
            backgroundColor: "#f8fafc",
            borderRadius: "30px",
            border: "2px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: "5rem", marginBottom: "20px" }}>📦</div>
          <h1
            style={{
              color: "#0f172a",
              fontSize: "2rem",
              marginBottom: "15px",
            }}
          >
            Votre panier est vide
          </h1>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Vous n&apos;avez sélectionné aucun équipement pour le moment.
          </p>
          <Link href="/products">
            <button
              type="button"
              style={{
                padding: "16px 40px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Explorer le catalogue
            </button>
          </Link>
        </div>
        {cartError ? (
          <p style={{ marginTop: "1rem", color: "#b91c1c", fontSize: "0.95rem" }}>
            {cartError}
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1300px",
        margin: "40px auto",
        padding: "0 20px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <header style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            color: "#0f172a",
            marginBottom: "10px",
          }}
        >
          Ma sélection
        </h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Vous avez <strong>{cart.length} équipement(s)</strong> dans votre
          panier professionnel.
        </p>
        {cartError ? (
          <p
            style={{
              marginTop: "12px",
              color: "#b91c1c",
              fontSize: "0.95rem",
            }}
          >
            {cartError}
          </p>
        ) : null}
      </header>

      <div
        className="cart-page-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "40px",
          alignItems: "start",
        }}
      >
        <section
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {hasUnavailableItems && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                padding: "15px 20px",
                borderRadius: "12px",
                border: "1px solid #fecaca",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>⚠️</span>
              Un ou plusieurs articles ne sont plus disponibles. Retirez-les pour
              valider votre commande.
            </div>
          )}

          {cart.map((item) => {
            const unavailable = isItemUnavailable(item);
            const maxQty = item.stockQuantity ?? 999;

            return (
              <div
                key={String(item.id)}
                style={{
                  display: "flex",
                  backgroundColor: "white",
                  borderRadius: "20px",
                  padding: "25px",
                  border: unavailable
                    ? "2px solid #fecaca"
                    : "1px solid #e2e8f0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  opacity: unavailable ? 0.7 : 1,
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <Link
                  href={`/products/${item.id}`}
                  style={{ display: "block", flexShrink: 0 }}
                >
                  <div
                    style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "15px",
                      overflow: "hidden",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl || FALLBACK_IMG}
                      alt={item.name || "Produit"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </div>
                </Link>

                <div
                  style={{
                    flex: 1,
                    minWidth: "220px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      gap: "12px",
                    }}
                  >
                    <Link
                      href={`/products/${item.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.2rem",
                          color: "#0f172a",
                          fontWeight: "600",
                        }}
                      >
                        {item.name}
                        {unavailable ? (
                          <span
                            style={{
                              marginLeft: "10px",
                              fontSize: "0.8rem",
                              backgroundColor: "#dc2626",
                              color: "white",
                              padding: "3px 8px",
                              borderRadius: "5px",
                              verticalAlign: "middle",
                            }}
                          >
                            Indisponible
                          </span>
                        ) : null}
                      </h3>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      Retirer
                    </button>
                  </div>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      marginBottom: "auto",
                    }}
                  >
                    Réf. AL-{item.id}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "20px",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "5px",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1 || unavailable}
                        style={{
                          padding: "5px 12px",
                          border: "none",
                          background: "none",
                          cursor:
                            item.quantity <= 1 || unavailable
                              ? "not-allowed"
                              : "pointer",
                          color: "#64748b",
                        }}
                      >
                        -
                      </button>
                      <span
                        style={{
                          width: "40px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={
                          unavailable || item.quantity >= maxQty
                        }
                        style={{
                          padding: "5px 12px",
                          border: "none",
                          background: "none",
                          cursor:
                            unavailable || item.quantity >= maxQty
                              ? "not-allowed"
                              : "pointer",
                          color: "#2563eb",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      {unavailable ? (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            color: "#dc2626",
                            textDecoration: "line-through",
                          }}
                        >
                          {(item.price * item.quantity).toLocaleString(
                            "fr-FR"
                          )}{" "}
                          €
                        </p>
                      ) : (
                        <>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.85rem",
                              color: "#94a3b8",
                            }}
                          >
                            Unité : {item.price.toLocaleString("fr-FR")} € HT
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "1.4rem",
                              fontWeight: "bold",
                              color: "#0f172a",
                            }}
                          >
                            {(item.price * item.quantity).toLocaleString(
                              "fr-FR"
                            )}{" "}
                            €
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <aside style={{ position: "sticky", top: "100px" }}>
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "25px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            }}
          >
            <h2
              style={{
                fontSize: "1.4rem",
                color: "#0f172a",
                marginBottom: "25px",
                marginTop: 0,
              }}
            >
              Résumé du devis
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748b",
                }}
              >
                <span>Sous-total HT</span>
                <span>{totalHT.toLocaleString("fr-FR")} €</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#64748b",
                }}
              >
                <span>TVA (20 %)</span>
                <span>{tva.toLocaleString("fr-FR")} €</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#16a34a",
                  fontWeight: "bold",
                }}
              >
                <span>Livraison</span>
                <span>OFFERTE</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                Total TTC
              </span>
              <span
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  color: "#2563eb",
                }}
              >
                {totalTTC.toLocaleString("fr-FR")} €
              </span>
            </div>

            {!isLoggedIn && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  color: "#b45309",
                }}
              >
                <strong>Astuce :</strong>{" "}
                <Link
                  href="/login"
                  style={{ color: "#b45309", textDecoration: "underline" }}
                >
                  Connectez-vous
                </Link>{" "}
                ou{" "}
                <Link
                  href="/register"
                  style={{ color: "#b45309", textDecoration: "underline" }}
                >
                  créez un compte
                </Link>{" "}
                pour sauvegarder votre panier.
              </div>
            )}

            <Link
              href={hasUnavailableItems ? "#" : "/checkout"}
              style={{
                textDecoration: "none",
                pointerEvents: hasUnavailableItems ? "none" : "auto",
                display: "block",
                marginBottom: "12px",
              }}
            >
              <button
                type="button"
                disabled={hasUnavailableItems}
                style={{
                  width: "100%",
                  padding: "20px",
                  backgroundColor: hasUnavailableItems ? "#94a3b8" : "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  fontWeight: "bold",
                  cursor: hasUnavailableItems ? "not-allowed" : "pointer",
                }}
              >
                {hasUnavailableItems
                  ? "Retirez les articles épuisés"
                  : "Valider ma commande"}
              </button>
            </Link>

            <button
              type="button"
              onClick={clearCart}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "white",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#475569",
              }}
            >
              Vider le panier
            </button>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @media (max-width: 960px) {
          .cart-page-layout {
            grid-template-columns: 1fr !important;
          }
          .cart-page-layout aside {
            position: static !important;
          }
        }
      `}</style>
    </main>
  );
}
