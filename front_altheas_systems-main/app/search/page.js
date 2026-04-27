"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSearchFilters, searchProducts } from "../../services/searchService";

const pageStyle = {
  padding: "1rem",
  maxWidth: "760px",
  margin: "0 auto",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const gridStyle = {
  display: "grid",
  gap: "0.75rem",
};

const labelStyle = {
  display: "grid",
  gap: "0.35rem",
  fontSize: "0.92rem",
  color: "#222",
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "0.95rem",
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({ facets: { categories: [], priceRanges: [] }, sortOptions: [] });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState("price_asc");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoadingResults, setIsLoadingResults] = useState(true);

  useEffect(() => {
    const queryFromUrl = searchParams.get("query") || "";
    setQuery(queryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    async function loadFilters() {
      const data = await getSearchFilters();
      setFilters(data);
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function loadResults() {
      setIsLoadingResults(true);
      const data = await searchProducts({
        query,
        category,
        priceRange,
        onlyAvailable,
        sort,
      });
      setResults(data.products);
      setTotal(data.total);
      setIsLoadingResults(false);
    }
    loadResults();
  }, [query, category, priceRange, onlyAvailable, sort]);

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Recherche produits</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Recherchez un produit, appliquez des filtres, puis triez les résultats.
      </p>

      <article style={cardStyle}>
        <div style={gridStyle}>
          <label style={labelStyle}>
            Recherche (titre ou description)
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex: scanner, moniteur..."
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Catégorie
            <select value={category} onChange={(event) => setCategory(event.target.value)} style={inputStyle}>
              <option value="">Toutes</option>
              {filters.facets.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            Prix
            <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} style={inputStyle}>
              <option value="">Tous</option>
              {filters.facets.priceRanges.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            Trier par
            <select value={sort} onChange={(event) => setSort(event.target.value)} style={inputStyle}>
              {filters.sortOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "price_asc"
                    ? "Prix croissant"
                    : item === "price_desc"
                      ? "Prix décroissant"
                      : item === "newest"
                        ? "Nouveauté"
                        : "Disponibilité"}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => setOnlyAvailable(event.target.checked)}
            />
            Afficher uniquement les produits disponibles
          </label>
        </div>
      </article>

      <article style={cardStyle}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Résultats ({total})</h2>
        {isLoadingResults ? (
          <p style={{ marginBottom: 0 }}>Chargement des résultats...</p>
        ) : results.length === 0 ? (
          <p style={{ marginBottom: 0 }}>Aucun produit trouvé.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {results.map((product) => (
              <div key={product.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "0.75rem" }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{product.name}</p>
                <p style={{ margin: "0.3rem 0 0 0", color: "#555" }}>{product.description}</p>
                <p style={{ margin: "0.3rem 0 0 0" }}>
                  {product.category} - {product.price} €
                </p>
                <p style={{ margin: "0.3rem 0 0 0", color: product.inStock ? "#15803d" : "#b91c1c" }}>
                  {product.inStock ? "Disponible" : "Rupture de stock"}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
