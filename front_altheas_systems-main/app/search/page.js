"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  fetchAllCategories,
  searchCatalogProducts,
} from "../../services/api/catalogApi";
import SearchProductCard from "../../components/catalog/SearchProductCard";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600";

const MAX_BUDGET = 300000;

function catalogAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base =
    process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:8082";
  const trimmed = base.replace(/\/$/, "");
  return `${trimmed}${path.startsWith("/") ? path : `/${path}`}`;
}

const getEditDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
};

const calculateMatchScore = (query, text) => {
  if (!query || !text) return 0;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase().trim();
  if (!q) return 0;
  if (t === q) return 100;
  if (Math.abs(q.length - t.length) <= 1 && getEditDistance(q, t) === 1)
    return 80;
  if (t.startsWith(q)) return 60;
  if (t.includes(q)) return 40;
  return 0;
};

const SORT_API = {
  price_asc: "price_asc",
  price_desc: "price_desc",
  date_new: "newest",
  date_old: "oldest",
  stock_first: "availability",
  newest: "newest",
};

function mapRowToCard(row) {
  const p = row.product || row;
  const imgs = row.images || [];
  const url = catalogAssetUrl(imgs[0]?.url);
  const stock = p.stock != null ? Number(p.stock) : 0;
  const priority = p.displayPriority ?? 0;
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    inStock: stock > 0,
    stockQuantity: stock,
    description: p.description || "",
    imageUrl: url || PLACEHOLDER_IMG,
    categoryName: p.categoryName || "",
    isPriority: priority >= 70,
  };
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "0.95rem",
  boxSizing: "border-box",
  outline: "none",
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const urlQuery =
    searchParams.get("query")?.trim() ||
    searchParams.get("q")?.trim() ||
    "";

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);

  const [searchTitle, setSearchTitle] = useState(urlQuery);
  const [searchDesc, setSearchDesc] = useState("");
  const [maxPrice, setMaxPrice] = useState(MAX_BUDGET);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [rawRows, setRawRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (urlQuery) setSearchTitle(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchAllCategories();
        if (!cancelled) {
          setCategories(Array.isArray(list) ? list : []);
          setCategoriesError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setCategoriesError(e.message || "Catégories indisponibles");
          setCategories([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const apiSort =
            sortBy === "relevance"
              ? undefined
              : SORT_API[sortBy] || SORT_API.newest;

          const data = await searchCatalogProducts({
            title: searchTitle.trim(),
            description: searchDesc.trim() || undefined,
            maxPrice: maxPrice < MAX_BUDGET ? maxPrice : undefined,
            available: inStockOnly ? true : undefined,
            categories:
              selectedCategories.length > 0 ? selectedCategories : undefined,
            sort: apiSort,
            page: 0,
            size: 500,
          });

          setRawRows(Array.isArray(data?.content) ? data.content : []);
          setTotalElements(
            typeof data?.totalElements === "number"
              ? data.totalElements
              : data?.content?.length ?? 0
          );
        } catch (e) {
          setError(
            e.message ||
              "Erreur de recherche. Vérifie le catalog-service (8082)."
          );
          setRawRows([]);
          setTotalElements(0);
        } finally {
          setLoading(false);
        }
      })();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    searchTitle,
    searchDesc,
    maxPrice,
    selectedCategories,
    inStockOnly,
    sortBy,
  ]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );
  }, [categories]);

  const filteredResults = useMemo(() => {
    const cards = rawRows.map(mapRowToCard);
    if (sortBy !== "relevance") return cards;

    const titleQ = searchTitle.trim();
    const descQ = searchDesc.trim();

    return [...cards].sort((a, b) => {
      const scoreB = Math.max(
        calculateMatchScore(titleQ, b.name),
        calculateMatchScore(descQ, b.description)
      );
      const scoreA = Math.max(
        calculateMatchScore(titleQ, a.name),
        calculateMatchScore(descQ, a.description)
      );
      return scoreB - scoreA;
    });
  }, [rawRows, sortBy, searchTitle, searchDesc]);

  function toggleCategory(name) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function resetFilters() {
    setSelectedCategories([]);
    setMaxPrice(MAX_BUDGET);
    setInStockOnly(false);
    setSearchDesc("");
    setSortBy("relevance");
  }

  const resultsLabel = searchTitle.trim() || "Tous les produits";

  if (loading && rawRows.length === 0 && !error) {
    return (
      <main
        style={{
          padding: "100px 20px",
          textAlign: "center",
          fontFamily: "sans-serif",
          backgroundColor: "#f8fafc",
          minHeight: "60vh",
        }}
      >
        Recherche dans le catalogue…
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "40px auto",
        padding: "0 20px 80px",
        fontFamily: "sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <section style={{ marginBottom: "40px" }}>
        <nav
          style={{
            marginBottom: "20px",
            fontSize: "0.85rem",
            color: "#64748b",
          }}
        >
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>
            Accueil
          </Link>{" "}
          / Recherche
        </nav>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              color: "#0f172a",
              margin: 0,
              maxWidth: "700px",
            }}
          >
            Résultats pour &laquo;&nbsp;{resultsLabel}&nbsp;&raquo;
          </h1>

          <div
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <span style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Trier par
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                outline: "none",
                backgroundColor: "white",
              }}
            >
              <option value="relevance">Pertinence</option>
              <option value="newest">Nouveautés (priorité)</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="date_new">Plus récents</option>
              <option value="date_old">Plus anciens</option>
              <option value="stock_first">En stock d&apos;abord</option>
            </select>
          </div>
        </div>

        <input
          type="search"
          placeholder="Rechercher un produit…"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          style={{ ...inputStyle, maxWidth: "560px", marginBottom: "12px" }}
        />
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 300px) 1fr",
          gap: "40px",
          alignItems: "start",
        }}
        className="search-layout"
      >
        <aside
          style={{
            alignSelf: "start",
            position: "sticky",
            top: "100px",
            backgroundColor: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "1.1rem",
              color: "#0f172a",
              margin: "0 0 20px 0",
            }}
          >
            Filtres
          </h2>

          {categoriesError && (
            <p style={{ color: "#b45309", fontSize: "0.85rem" }}>
              {categoriesError}
            </p>
          )}

          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "16px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "10px",
                color: "#334155",
              }}
            >
              Catégories
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedCategories.length === 0 ? (
                <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                  Aucune catégorie
                </span>
              ) : (
                sortedCategories.map((cat) => (
                  <label
                    key={String(cat.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      color: "#475569",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => toggleCategory(cat.name)}
                      style={{ width: "18px", height: "18px" }}
                    />
                    {cat.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "16px",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "10px",
                color: "#334155",
              }}
            >
              Budget maximum
            </h3>
            <p
              style={{
                fontWeight: "bold",
                color: "#2563eb",
                marginBottom: "10px",
              }}
            >
              {maxPrice.toLocaleString("fr-FR")} €
            </p>
            <input
              type="range"
              min="0"
              max={MAX_BUDGET}
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#334155",
              }}
            >
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: "20px", height: "20px" }}
              />
              En stock uniquement
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: showAdvanced ? "12px" : "16px",
              backgroundColor: "transparent",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              color: "#64748b",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {showAdvanced ? "Masquer les filtres avancés" : "Filtres avancés"}
          </button>

          {showAdvanced && (
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Description / mots-clés
              </label>
              <input
                type="text"
                placeholder="Description, fiche technique…"
                value={searchDesc}
                onChange={(e) => setSearchDesc(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <button
            type="button"
            onClick={resetFilters}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#f1f5f9",
              border: "none",
              borderRadius: "10px",
              color: "#64748b",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Réinitialiser les filtres
          </button>
        </aside>

        <section style={{ minWidth: 0 }}>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            {loading
              ? "Recherche…"
              : `${totalElements} équipement(s) trouvé(s)`}
          </p>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {!loading && filteredResults.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "#64748b",
                backgroundColor: "white",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0" }}>
                Aucun résultat ne correspond à vos filtres.
              </h3>
              <p style={{ margin: 0 }}>
                Essayez d&apos;élargir votre recherche ou de réinitialiser les
                filtres.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "30px",
              }}
            >
              {filteredResults.map((product) => (
                <SearchProductCard key={String(product.id)} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .search-layout {
            grid-template-columns: 1fr !important;
          }
          .search-layout aside {
            position: static !important;
          }
        }
      `}</style>
    </main>
  );
}
