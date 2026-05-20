"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchAllCategories,
  fetchCategoryById,
  fetchProductsByCategory,
  fetchProductSearch,
} from "../../services/api/catalogApi";

const DEFAULT_HERO = {
  name: "Catalogue Complet",
  description:
    "Découvrez l'ensemble de notre matériel médical et chirurgical de haute technologie.",
  imageUrl:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200",
};

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

/** Accepte ProductWithImagesDto ou produit « plat » (mock). */
function normalizeProductRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    if (row.product != null && typeof row.product === "object") {
      const p = row.product;
      const images = row.images || [];
      const url = images[0]?.url;
      const stock = p.stock;
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        inStock: stock != null && Number(stock) > 0,
        priority: p.displayPriority ?? 999,
        imageUrl: catalogAssetUrl(url),
      };
    }
    const stockQty = row.stockQuantity ?? row.stock;
    const rawUrl = row.imageUrl;
    return {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      inStock:
        typeof row.inStock === "boolean"
          ? row.inStock
          : stockQty != null && Number(stockQty) > 0,
      priority: row.priority ?? row.displayPriority ?? 999,
      imageUrl:
        typeof rawUrl === "string" && rawUrl.startsWith("http")
          ? rawUrl
          : catalogAssetUrl(rawUrl),
    };
  });
}

function matchCategoryFromParam(categories, categoryParam) {
  if (!categoryParam?.trim()) return null;
  const decoded = decodeURIComponent(categoryParam).trim();
  const lower = decoded.toLowerCase();
  const exact = categories.find(
    (c) => c.name?.trim().toLowerCase() === lower
  );
  if (exact) return exact;
  return categories.find(
    (c) =>
      c.name?.toLowerCase().includes(lower) ||
      String(c.id).toLowerCase() === lower
  );
}

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayData, setDisplayData] = useState(DEFAULT_HERO);
  const [rawRows, setRawRows] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const categories = await fetchAllCategories();
        if (cancelled) return;

        const matched = matchCategoryFromParam(categories, categoryParam || "");

        if (matched) {
          const [catMeta, products] = await Promise.all([
            fetchCategoryById(matched.id),
            fetchProductsByCategory(matched.id),
          ]);
          if (cancelled) return;

          const meta = catMeta && typeof catMeta === "object" ? catMeta : {};
          setDisplayData({
            name: meta.name || matched.name || DEFAULT_HERO.name,
            description:
              meta.description ||
              matched.description ||
              DEFAULT_HERO.description,
            imageUrl:
              meta.imageUrl ||
              matched.imageUrl ||
              DEFAULT_HERO.imageUrl,
          });
          setRawRows(products || []);
        } else {
          if (categoryParam) {
            setDisplayData({
              ...DEFAULT_HERO,
              description: `Aucune catégorie correspondant à « ${decodeURIComponent(categoryParam)} ». Voici tout le catalogue.`,
            });
          } else {
            setDisplayData(DEFAULT_HERO);
          }

          const page = await fetchProductSearch({
            page: 0,
            size: 500,
            sort: "availability",
          });
          if (cancelled) return;
          setRawRows(page?.content || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message ||
              "Impossible de charger le catalogue. Vérifie le catalog-service (8082)."
          );
          setRawRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryParam]);

  const sortedProducts = useMemo(() => {
    const list = normalizeProductRows(rawRows);
    return [...list].sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return (a.priority ?? 999) - (b.priority ?? 999);
    });
  }, [rawRows]);

  if (loading) {
    return (
      <main
        style={{
          fontFamily: "sans-serif",
          padding: "3rem",
          textAlign: "center",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        Chargement du catalogue…
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          fontFamily: "sans-serif",
          padding: "3rem",
          textAlign: "center",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      <section
        style={{
          position: "relative",
          height: "300px",
          backgroundImage: `url(${displayData.imageUrl || DEFAULT_HERO.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
          }}
        />
        <h1
          style={{
            position: "relative",
            color: "white",
            fontSize: "3rem",
            fontWeight: "bold",
            margin: 0,
            textShadow: "0 4px 6px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          {displayData.name}
        </h1>
      </section>

      <section
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.2rem", color: "#475569", lineHeight: "1.8" }}>
          {displayData.description}
        </p>
      </section>

      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {sortedProducts.map((product) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  opacity: product.inStock ? 1 : 0.6,
                  filter: product.inStock ? "none" : "grayscale(50%)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (product.inStock)
                    e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  if (product.inStock)
                    e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    height: "200px",
                    backgroundImage: `url(${product.imageUrl || PLACEHOLDER_IMG})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#e2e8f0",
                  }}
                />

                <div
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.3rem",
                      color: "#0f172a",
                      fontWeight: "bold",
                      marginBottom: "10px",
                      margin: 0,
                    }}
                  >
                    {product.name}
                  </h2>
                  <span
                    style={{
                      fontSize: "1.2rem",
                      color: "#2563eb",
                      fontWeight: "bold",
                      marginBottom: "15px",
                    }}
                  >
                    {Number.isFinite(product.price)
                      ? product.price.toLocaleString("fr-FR")
                      : "—"}{" "}
                    €
                  </span>

                  {!product.inStock && (
                    <div
                      style={{
                        marginTop: "auto",
                        padding: "8px",
                        backgroundColor: "#fee2e2",
                        color: "#ef4444",
                        fontWeight: "bold",
                        textAlign: "center",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                    >
                      En rupture de stock
                    </div>
                  )}

                  {product.inStock && (
                    <button
                      type="button"
                      style={{
                        marginTop: "auto",
                        backgroundColor: "#0f172a",
                        color: "white",
                        border: "none",
                        padding: "12px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Voir le produit
                    </button>
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
