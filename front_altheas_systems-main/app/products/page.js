"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchAllCategories,
  fetchProductsByCategory,
} from "../../services/api/catalogApi";
import CatalogProductCard from "../../components/catalog/CatalogProductCard";

const HERO = {
  title: "Catalogue Général",
  description:
    "Parcourez l'intégralité de nos équipements de pointe. Découvrez nos domaines d'expertise pour répondre à tous vos besoins médicaux.",
  imageUrl:
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600",
};

function catalogAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base =
    process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:8082";
  const trimmed = base.replace(/\/$/, "");
  return `${trimmed}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Accepte ProductWithImagesDto ou produit plat. */
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

function sortCatalogProducts(products) {
  return [...products].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return (a.priority ?? 999) - (b.priority ?? 999);
  });
}

function sectionAnchorId(categoryId) {
  return `category-${categoryId}`;
}

function matchCategoryParam(sections, categoryParam) {
  if (!categoryParam?.trim()) return null;
  const decoded = decodeURIComponent(categoryParam).trim().toLowerCase();
  return (
    sections.find((s) => String(s.id).toLowerCase() === decoded) ||
    sections.find((s) => s.name?.trim().toLowerCase() === decoded) ||
    sections.find((s) => s.name?.toLowerCase().includes(decoded))
  );
}

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const categories = await fetchAllCategories();
        if (cancelled) return;

        const activeCategories = (Array.isArray(categories) ? categories : [])
          .filter((c) => c.active !== false)
          .sort(
            (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
          );

        const loadedSections = await Promise.all(
          activeCategories.map(async (cat) => {
            const productsRaw = await fetchProductsByCategory(cat.id);
            return {
              id: cat.id,
              name: cat.name || "Catégorie",
              description: cat.description || "",
              products: sortCatalogProducts(
                normalizeProductRows(productsRaw || [])
              ),
            };
          })
        );

        if (!cancelled) setSections(loadedSections);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message ||
              "Impossible de charger le catalogue. Vérifie le catalog-service (8082)."
          );
          setSections([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || sections.length === 0 || !categoryParam) return;
    const matched = matchCategoryParam(sections, categoryParam);
    if (!matched) return;
    const el = document.getElementById(sectionAnchorId(matched.id));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, sections, categoryParam]);

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
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        paddingBottom: "80px",
      }}
    >
      <section
        style={{
          backgroundColor: "#0f172a",
          color: "white",
          padding: "70px 20px",
          textAlign: "center",
          backgroundImage: `url('${HERO.imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "bold",
            margin: "0 0 15px 0",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {HERO.title}
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            maxWidth: "700px",
            margin: "0 auto",
            lineHeight: "1.6",
            textShadow: "0 1px 5px rgba(0,0,0,0.5)",
          }}
        >
          {HERO.description}
        </p>
      </section>

      <div
        style={{ maxWidth: "1300px", margin: "0 auto", padding: "40px 20px" }}
      >
        {sections.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "60px",
              justifyContent: "center",
            }}
          >
            {sections.map((cat) => (
              <a
                key={cat.id}
                href={`#${sectionAnchorId(cat.id)}`}
                style={{
                  textDecoration: "none",
                  backgroundColor: "white",
                  padding: "12px 25px",
                  borderRadius: "50px",
                  color: "#0f172a",
                  fontWeight: "bold",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#0f172a";
                }}
              >
                {cat.name} ↓
              </a>
            ))}
          </div>
        )}

        {sections.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#64748b",
              fontSize: "1.1rem",
            }}
          >
            Aucune catégorie disponible pour le moment.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "80px" }}
          >
            {sections.map((category) => (
              <section
                key={category.id}
                id={sectionAnchorId(category.id)}
                style={{ scrollMarginTop: "40px" }}
              >
                <div
                  style={{
                    borderBottom: "3px solid #e2e8f0",
                    paddingBottom: "15px",
                    marginBottom: "30px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "2.2rem",
                      color: "#0f172a",
                      margin: "0 0 10px 0",
                    }}
                  >
                    {category.name}
                  </h2>
                  {category.description ? (
                    <p
                      style={{
                        color: "#64748b",
                        margin: 0,
                        fontSize: "1.1rem",
                        maxWidth: "800px",
                      }}
                    >
                      {category.description}
                    </p>
                  ) : null}
                </div>

                {category.products.length === 0 ? (
                  <p style={{ color: "#64748b" }}>
                    Aucun produit dans cette catégorie pour le moment.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "30px",
                    }}
                  >
                    {category.products.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
