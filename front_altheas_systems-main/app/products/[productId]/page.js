"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  fetchProductById,
  fetchSimilarProducts,
} from "../../../services/api/catalogApi";
import { API_CONFIG } from "../../../services/config";
import { useCart } from "../../../context/CartContext";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600";

function catalogAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base =
    process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:8082";
  const trimmed = base.replace(/\/$/, "");
  return `${trimmed}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Réponse GET /products/:id ou ancienne forme mock « plate ». */
function normalizeDetail(payload) {
  if (!payload) return null;

  if (payload.product != null) {
    const p = payload.product;
    const images = Array.isArray(payload.images) ? payload.images : [];
    const urls = images
      .map((img) => catalogAssetUrl(img?.url))
      .filter(Boolean);
    const stock = p.stock != null ? Number(p.stock) : 0;
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      description: p.description || "",
      inStock: stock > 0,
      stockQuantity: stock,
      imageUrls: urls.length > 0 ? urls : [PLACEHOLDER_IMG],
      specifications: Array.isArray(p.specifications)
        ? p.specifications
        : Array.isArray(payload.specifications)
          ? payload.specifications
          : [],
    };
  }

  const rawImages = payload.images;
  const urlsFromLegacy =
    Array.isArray(rawImages) && rawImages.length > 0
      ? rawImages.map((u) =>
          typeof u === "string" ? catalogAssetUrl(u) : catalogAssetUrl(u?.url)
        )
      : payload.imageUrl
        ? [catalogAssetUrl(payload.imageUrl)]
        : [PLACEHOLDER_IMG];

  const stockQty =
    payload.stockQuantity ?? payload.stock ?? (payload.inStock ? 1 : 0);
  const stock = Number(stockQty);

  return {
    id: payload.id,
    name: payload.name,
    price: Number(payload.price),
    description:
      payload.fullDescription ||
      payload.description ||
      "Ce produit répond aux exigences de votre établissement de santé.",
    inStock:
      typeof payload.inStock === "boolean"
        ? payload.inStock
        : stock > 0,
    stockQuantity: stock,
    imageUrls: urlsFromLegacy.filter(Boolean).length
      ? urlsFromLegacy.filter(Boolean)
      : [PLACEHOLDER_IMG],
    specifications: Array.isArray(payload.technicalSpecs)
      ? payload.technicalSpecs
      : Array.isArray(payload.specifications)
        ? payload.specifications
        : [],
  };
}

function normalizeSimilarDto(similarPayload) {
  if (!similarPayload) return [];

  if (Array.isArray(similarPayload)) {
    return similarPayload.map((item) => {
      if (item.product != null) {
        const p = item.product;
        const img = item.images?.[0]?.url;
        return {
          id: p.id,
          name: p.name,
          price: Number(p.price),
          inStock: (p.stock ?? 0) > 0,
          imageUrl: catalogAssetUrl(img) || PLACEHOLDER_IMG,
        };
      }
      return {
        id: item.id,
        name: item.name,
        price: Number(item.price),
        inStock:
          typeof item.inStock === "boolean"
            ? item.inStock
            : (item.stock ?? 0) > 0,
        imageUrl: item.imageUrl
          ? catalogAssetUrl(item.imageUrl)
          : PLACEHOLDER_IMG,
      };
    });
  }

  const list =
    similarPayload.similarProducts ??
    similarPayload.similar_products ??
    [];
  if (!Array.isArray(list)) return [];
  return list.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    inStock: (p.stock ?? 0) > 0,
    imageUrl: PLACEHOLDER_IMG,
  }));
}

export default function ProductPage() {
  const params = useParams();
  const pathname = usePathname();
  const { addToCart } = useCart();

  const rawId =
    params?.productId ?? params?.productid ?? pathname.split("/").pop();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setProduct(null);
      setSimilarProducts([]);
      setCurrentImage(null);

      const idNum = Number(rawId);
      const fetchId =
        API_CONFIG.useMocks && !Number.isFinite(idNum)
          ? rawId
          : idNum;

      if (
        !API_CONFIG.useMocks &&
        (!Number.isFinite(fetchId) || fetchId <= 0)
      ) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const [detail, similarRaw] = await Promise.all([
          fetchProductById(fetchId),
          fetchSimilarProducts(fetchId),
        ]);
        if (cancelled) return;

        const normalized = normalizeDetail(detail);
        if (!normalized) {
          setNotFound(true);
          return;
        }

        setProduct(normalized);
        setSimilarProducts(normalizeSimilarDto(similarRaw));
        setCurrentImage(
          normalized.imageUrls?.[0] ?? PLACEHOLDER_IMG
        );
      } catch (e) {
        if (cancelled) return;
        if (e.status === 404) {
          setNotFound(true);
        } else {
          setError(
            e.message ||
              "Impossible de charger le produit. Vérifie le catalog-service (8082)."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rawId]);

  const cartPayload = useMemo(() => {
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity ?? (product.inStock ? 1 : 0),
      imageUrl: product.imageUrls?.[0] || PLACEHOLDER_IMG,
    };
  }, [product]);

  if (loading) {
    return (
      <main
        style={{
          fontFamily: "sans-serif",
          padding: "4rem",
          textAlign: "center",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        Chargement du produit…
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          fontFamily: "sans-serif",
          padding: "4rem",
          textAlign: "center",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <p style={{ color: "#b91c1c" }}>{error}</p>
        <Link
          href="/products"
          style={{ color: "#2563eb", marginTop: "1rem", display: "inline-block" }}
        >
          Retour au catalogue
        </Link>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2rem",
            color: "#0f172a",
            marginBottom: "20px",
          }}
        >
          Produit introuvable.
        </h1>
        <p>L&apos;ID recherché était : {rawId}</p>
        <Link
          href="/products"
          style={{ color: "#2563eb", textDecoration: "underline" }}
        >
          Retourner au catalogue
        </Link>
      </div>
    );
  }

  const heroImage =
    currentImage ??
    product.imageUrls?.[0] ??
    PLACEHOLDER_IMG;

  const techSpecs =
    product.specifications?.length > 0
      ? product.specifications
      : [];

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
          style={{
            color: "#475569",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Retour en arrière
        </Link>
      </div>

      <section
        style={{
          maxWidth: "1200px",
          margin: "20px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "50px",
        }}
      >
        <div>
          <div
            style={{
              width: "100%",
              height: "400px",
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "16px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              transition: "background-image 0.3s ease-in-out",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "20px",
              overflowX: "auto",
            }}
          >
            {product.imageUrls.map((img, index) => (
              <div
                key={`${img}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => setCurrentImage(img)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setCurrentImage(img);
                }}
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border:
                    currentImage === img
                      ? "3px solid #2563eb"
                      : "2px solid transparent",
                  opacity: currentImage === img ? 1 : 0.6,
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              color: "#0f172a",
              fontWeight: "bold",
              margin: "0 0 10px 0",
            }}
          >
            {product.name}
          </h1>

          <div
            style={{
              fontSize: "2rem",
              color: "#2563eb",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {Number.isFinite(product.price)
              ? product.price.toLocaleString("fr-FR")
              : "—"}{" "}
            €{" "}
            <span
              style={{
                fontSize: "1rem",
                color: "#64748b",
                fontWeight: "normal",
              }}
            >
              HT
            </span>
          </div>

          <div style={{ marginBottom: "30px" }}>
            {product.inStock ? (
              <span
                style={{
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  padding: "8px 15px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                ✓ En Stock - Prêt à être expédié
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  padding: "8px 15px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                ✗ Rupture de Stock
              </span>
            )}
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                color: "#0f172a",
                fontWeight: "bold",
                borderBottom: "2px solid #e2e8f0",
                paddingBottom: "10px",
                marginBottom: "15px",
              }}
            >
              Description du produit
            </h3>
            <p
              style={{
                color: "#475569",
                lineHeight: "1.7",
                fontSize: "1.05rem",
              }}
            >
              {product.description}
            </p>
          </div>

          {techSpecs.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  color: "#0f172a",
                  fontWeight: "bold",
                  borderBottom: "2px solid #e2e8f0",
                  paddingBottom: "10px",
                  marginBottom: "15px",
                }}
              >
                Caractéristiques Techniques
              </h3>
              <ul
                style={{
                  color: "#475569",
                  lineHeight: "1.8",
                  paddingLeft: "20px",
                }}
              >
                {techSpecs.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <button
              type="button"
              onClick={() => cartPayload && addToCart(cartPayload)}
              disabled={!product.inStock}
              style={{
                backgroundColor: product.inStock ? "#2563eb" : "#cbd5e1",
                color: "white",
                padding: "18px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                borderRadius: "12px",
                border: "none",
                cursor: product.inStock ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                boxShadow: product.inStock
                  ? "0 4px 10px rgba(37, 99, 235, 0.3)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (product.inStock)
                  e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                if (product.inStock) e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {product.inStock ? "🛒 Ajouter au panier" : "En rupture de stock"}
            </button>

            {product.inStock && (
              <button
                type="button"
                style={{
                  backgroundColor: "transparent",
                  color: "#2563eb",
                  padding: "12px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  border: "2px solid #2563eb",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#eff6ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                📅 Entamer une période d&apos;essai ou s&apos;abonner
              </button>
            )}
          </div>
        </div>
      </section>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #e2e8f0",
          margin: "60px auto",
          maxWidth: "1200px",
        }}
      />

      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h2
          style={{
            fontSize: "1.8rem",
            color: "#0f172a",
            fontWeight: "bold",
            marginBottom: "30px",
          }}
        >
          Vous pourriez aussi être intéressé par...
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
          }}
        >
          {similarProducts.map((simProduct) => (
            <Link
              href={`/products/${simProduct.id}`}
              key={simProduct.id}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  opacity: simProduct.inStock ? 1 : 0.6,
                  filter: simProduct.inStock ? "none" : "grayscale(50%)",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (simProduct.inStock)
                    e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  if (simProduct.inStock)
                    e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    height: "160px",
                    backgroundImage: `url(${simProduct.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ padding: "15px" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      color: "#0f172a",
                      fontWeight: "bold",
                      margin: "0 0 10px 0",
                    }}
                  >
                    {simProduct.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "1.1rem",
                      color: "#2563eb",
                      fontWeight: "bold",
                    }}
                  >
                    {simProduct.price.toLocaleString("fr-FR")} €
                  </span>
                  {!simProduct.inStock && (
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "0.8rem",
                        color: "#ef4444",
                        fontWeight: "bold",
                      }}
                    >
                      Rupture de stock
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
