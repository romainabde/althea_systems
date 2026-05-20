"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  fetchAllCategories,
  searchCatalogProducts,
} from "../../services/api/catalogApi";

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

/* Distance de Levenshtein (pertinence côté client) */
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

/** Tri serveur Spring ProductSearchRequest.sort */
const SORT_API = {
  price_asc: "price_asc",
  price_desc: "price_desc",
  date_new: "newest",
  date_old: "oldest",
  stock_first: "availability",
};

function mapRowToCard(row) {
  const p = row.product || row;
  const imgs = row.images || [];
  const url = catalogAssetUrl(imgs[0]?.url);
  const stock = p.stock != null ? Number(p.stock) : 0;
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    inStock: stock > 0,
    description: p.description || "",
    imageUrl: url || PLACEHOLDER_IMG,
  };
}

export default function SearchPage() {
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);

  const [searchTitle, setSearchTitle] = useState("");
  const [searchDesc, setSearchDesc] = useState("");
  const [searchSpecs, setSearchSpecs] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  const [rawRows, setRawRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const descCombined = [searchDesc, searchSpecs]
            .filter(Boolean)
            .join(" ")
            .trim();
          const apiSort =
            sortBy === "relevance" ? undefined : SORT_API[sortBy];

          const data = await searchCatalogProducts({
            title: searchTitle.trim(),
            description: descCombined,
            minPrice: minPrice === "" ? undefined : minPrice,
            maxPrice: maxPrice === "" ? undefined : maxPrice,
            available: inStockOnly ? true : undefined,
            categories: selectedCategory ? [selectedCategory] : undefined,
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
    searchSpecs,
    minPrice,
    maxPrice,
    selectedCategory,
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
    const descQ = [searchDesc, searchSpecs].filter(Boolean).join(" ").trim();

    return [...cards].sort((a, b) => {
      const scoreB = Math.max(
        calculateMatchScore(titleQ, b.name),
        calculateMatchScore(descQ, b.description),
        calculateMatchScore(searchSpecs.trim(), b.description)
      );
      const scoreA = Math.max(
        calculateMatchScore(titleQ, a.name),
        calculateMatchScore(descQ, a.description),
        calculateMatchScore(searchSpecs.trim(), a.description)
      );
      return scoreB - scoreA;
    });
  }, [rawRows, sortBy, searchTitle, searchDesc, searchSpecs]);

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "#0f172a",
          color: "white",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2.5rem" }}>Recherche Avancée</h1>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "40px auto",
          padding: "0 20px",
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
        }}
      >
        <aside
          style={{
            flex: "1 1 300px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            height: "fit-content",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              marginBottom: "20px",
              color: "#1e293b",
            }}
          >
            Filtres
          </h2>

          {categoriesError && (
            <p style={{ color: "#b45309", fontSize: "0.85rem" }}>
              {categoriesError}
            </p>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="text"
              placeholder="Titre du produit..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Description..."
              value={searchDesc}
              onChange={(e) => setSearchDesc(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Mot-clé (description / fiche)..."
              value={searchSpecs}
              onChange={(e) => setSearchSpecs(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                placeholder="Prix Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Prix Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={inputStyle}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="">Toutes les catégories</option>
              {sortedCategories.map((c) => (
                <option key={String(c.id)} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              Produits disponibles uniquement
            </label>
          </div>
        </aside>

        <section style={{ flex: "3 1 600px" }}>
          <div
            style={{
              backgroundColor: "white",
              padding: "15px 20px",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <span style={{ fontWeight: "bold", color: "#64748b" }}>
              {loading
                ? "Recherche…"
                : `${totalElements} produit(s) trouvé(s)${
                    totalElements > filteredResults.length
                      ? ` (${filteredResults.length} affichés)`
                      : ""
                  }`}
            </span>

            <div
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <label style={{ fontSize: "0.9rem", color: "#475569" }}>
                Trier par :
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ ...inputStyle, width: "auto", padding: "5px 10px" }}
              >
                <option value="relevance">Pertinence</option>
                <option value="price_asc">Prix : Croissant</option>
                <option value="price_desc">Prix : Décroissant</option>
                <option value="date_new">Nouveautés : Plus récents</option>
                <option value="date_old">Nouveautés : Plus anciens</option>
                <option value="stock_first">
                  Disponibilité : En stock d&apos;abord
                </option>
              </select>
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredResults.map((p) => (
              <Link
                href={`/products/${p.id}`}
                key={String(p.id)}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "150px",
                      backgroundImage: `url(${p.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      backgroundColor: "#e2e8f0",
                    }}
                  />
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#0f172a",
                      fontSize: "1.1rem",
                    }}
                  >
                    {p.name}
                  </h3>
                  <div
                    style={{
                      color: "#2563eb",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      marginBottom: "10px",
                    }}
                  >
                    {Number.isFinite(p.price)
                      ? p.price.toLocaleString("fr-FR")
                      : "—"}{" "}
                    €
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      fontSize: "0.85rem",
                      color: p.inStock ? "#16a34a" : "#dc2626",
                      fontWeight: "bold",
                    }}
                  >
                    {p.inStock ? "● En stock" : "○ Rupture de stock"}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!loading && filteredResults.length === 0 && (
            <div style={{ textAlign: "center", padding: "100px", color: "#64748b" }}>
              <h3>Aucun résultat ne correspond à vos filtres.</h3>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "0.9rem",
  boxSizing: "border-box",
};
