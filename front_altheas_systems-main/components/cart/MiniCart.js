"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=200";

export default function MiniCart() {
  const {
    cart,
    isMiniCartOpen,
    setIsMiniCartOpen,
    cartTotalHT,
    removeFromCart,
    updateQuantity,
  } = useCart();

  if (!isMiniCartOpen) return null;

  const lineTotal = (item) =>
    Number.isFinite(item.price) ? item.price * item.quantity : 0;

  return (
    <>
      <div
        role="presentation"
        onClick={() => setIsMiniCartOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 9998,
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "min(450px, 100vw)",
          height: "100vh",
          backgroundColor: "white",
          zIndex: 9999,
          boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          padding: "25px",
          fontFamily: "sans-serif",
          animation: "miniCartSlideIn 0.3s ease-out",
          boxSizing: "border-box",
        }}
      >
        <style>{`
          @keyframes miniCartSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .mini-cart-scroll::-webkit-scrollbar { width: 8px; }
          .mini-cart-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
          .mini-cart-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        `}</style>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "2px solid #f1f5f9",
            paddingBottom: "15px",
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#0f172a" }}>
            Mon panier
          </h2>
          <button
            type="button"
            onClick={() => setIsMiniCartOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#64748b",
            }}
            aria-label="Fermer le panier"
          >
            ✕
          </button>
        </div>

        <div
          className="mini-cart-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "8px",
            marginBottom: "15px",
          }}
        >
          {cart.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#64748b",
                padding: "40px 10px",
              }}
            >
              Votre panier est vide.
            </p>
          ) : (
            cart.map((item) => {
              const unavailable = item.inStock === false;
              const maxQty = item.stockQuantity ?? 999;

              return (
                <div
                  key={String(item.id)}
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "20px",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "20px",
                    opacity: unavailable ? 0.75 : 1,
                  }}
                >
                  <Link
                    href={`/products/${item.id}`}
                    onClick={() => setIsMiniCartOpen(false)}
                    style={{ flexShrink: 0 }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || FALLBACK_IMG}
                        alt={item.name || "Produit"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
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
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <Link
                        href={`/products/${item.id}`}
                        onClick={() => setIsMiniCartOpen(false)}
                        style={{ textDecoration: "none", minWidth: 0 }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "1rem",
                            color: "#0f172a",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.name}
                        </h4>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                          padding: 0,
                          flexShrink: 0,
                        }}
                        aria-label="Retirer du panier"
                      >
                        🗑️
                      </button>
                    </div>

                    {unavailable ? (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#dc2626",
                          fontWeight: "bold",
                          marginTop: "6px",
                        }}
                      >
                        Indisponible
                      </span>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginTop: "10px",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1 || unavailable}
                          style={{
                            padding: "5px 10px",
                            border: "none",
                            background: "#f8fafc",
                            cursor:
                              item.quantity <= 1 || unavailable
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          -
                        </button>
                        <span
                          style={{
                            width: "30px",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
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
                            padding: "5px 10px",
                            border: "none",
                            background: "#f8fafc",
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
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "bold",
                          color: unavailable ? "#94a3b8" : "#2563eb",
                          fontSize: "1.05rem",
                          textDecoration: unavailable
                            ? "line-through"
                            : "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lineTotal(item).toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div
            style={{
              borderTop: "2px solid #f1f5f9",
              paddingTop: "20px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              <span>Total HT</span>
              <span>{(cartTotalHT || 0).toLocaleString("fr-FR")} €</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMiniCartOpen(false)}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "white",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              Continuer mes achats
            </button>
            <Link
              href="/cart"
              onClick={() => setIsMiniCartOpen(false)}
              style={{ textDecoration: "none", display: "block" }}
            >
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "18px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Accéder à ma commande
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
