"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { mockCatalogData } from "../../services/mocks/catalog.mock";

/* 🧠 ALGORITHME : Distance de Levenshtein (Correction d'orthographe) */
const getEditDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
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
  if (t === q) return 100; // Exact
  if (Math.abs(q.length - t.length) <= 1 && getEditDistance(q, t) === 1) return 80; // 1 diff
  if (t.startsWith(q)) return 60; // Commence par
  if (t.includes(q)) return 40; // Contient
  return 0;
};

export default function SearchPage() {
  const allCategories = Object.keys(mockCatalogData);
  
  const allProducts = useMemo(() => {
    let list = [];
    for (const key in mockCatalogData) {
      const cat = mockCatalogData[key];
      list = [...list, ...cat.products.map(p => ({
        ...p,
        categoryName: cat.name,
        categoryKey: key,
        // Simulation de date si absente pour le tri nouveauté
        dateObj: new Date(p.createdAt || "2024-01-01"),
        fullDesc: p.fullDescription || cat.description
      }))];
    }
    return list;
  }, []);

  // ÉTATS DES FILTRES
  const [searchTitle, setSearchTitle] = useState("");
  const [searchDesc, setSearchDesc] = useState("");
  const [searchSpecs, setSearchSpecs] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // ÉTAT DU TRI (Nouveau !)
  const [sortBy, setSortBy] = useState("relevance"); // relevance, price_asc, price_desc, date_new, date_old, stock_first

  // 🚀 MOTEUR DE RECHERCHE + FILTRAGE + TRI (< 100ms)
  const filteredResults = useMemo(() => {
    let results = allProducts.map(p => ({
      ...p,
      score: Math.max(
        calculateMatchScore(searchTitle, p.name),
        calculateMatchScore(searchDesc, p.fullDesc)
      )
    }));

    // FILTRAGE
    results = results.filter(p => {
      if (searchTitle && p.score === 0) return false;
      if (searchSpecs && !p.technicalSpecs?.some(s => s.toLowerCase().includes(searchSpecs.toLowerCase()))) return false;
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      if (selectedCategory && p.categoryKey !== selectedCategory) return false;
      if (inStockOnly && !p.inStock) return false;
      return true;
    });

    // TRI DYNAMIQUE
    results.sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "date_new": return b.dateObj - a.dateObj;
        case "date_old": return a.dateObj - b.dateObj;
        case "stock_first": return (a.inStock === b.inStock) ? 0 : a.inStock ? -1 : 1;
        default: return b.score - a.score; // Par défaut : Pertinence
      }
    });

    return results;
  }, [allProducts, searchTitle, searchDesc, searchSpecs, minPrice, maxPrice, selectedCategory, inStockOnly, sortBy]);

  return (
    <main style={{ fontFamily: 'sans-serif', backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      <div style={{ backgroundColor: "#0f172a", color: "white", padding: "40px 20px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem" }}>Recherche Avancée</h1>
      </div>

      <div style={{ maxWidth: "1400px", margin: "40px auto", padding: "0 20px", display: "flex", gap: "30px", flexWrap: "wrap" }}>
        
        {/* BARRE LATÉRALE : FILTRES */}
        <aside style={{ flex: "1 1 300px", backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#1e293b" }}>Filtres</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="text" placeholder="Titre du produit..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Description..." value={searchDesc} onChange={e => setSearchDesc(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Caractéristique technique..." value={searchSpecs} onChange={e => setSearchSpecs(e.target.value)} style={inputStyle} />
            
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="number" placeholder="Prix Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={inputStyle} />
              <input type="number" placeholder="Prix Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={inputStyle} />
            </div>

            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={inputStyle}>
              <option value="">Toutes les catégories</option>
              {allCategories.map(c => <option key={c} value={c}>{mockCatalogData[c].name}</option>)}
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "bold" }}>
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
              Produits disponibles uniquement
            </label>
          </div>
        </aside>

        {/* SECTION RÉSULTATS */}
        <section style={{ flex: "3 1 600px" }}>
          
          {/* BARRE DE TRI (Nouveau !) */}
          <div style={{ backgroundColor: "white", padding: "15px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <span style={{ fontWeight: "bold", color: "#64748b" }}>{filteredResults.length} produits trouvés</span>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "0.9rem", color: "#475569" }}>Trier par :</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 10px" }}>
                <option value="relevance">Pertinence</option>
                <option value="price_asc">Prix : Croissant</option>
                <option value="price_desc">Prix : Décroissant</option>
                <option value="date_new">Nouveautés : Plus récents</option>
                <option value="date_old">Nouveautés : Plus anciens</option>
                <option value="stock_first">Disponibilité : En stock d'abord</option>
              </select>
            </div>
          </div>

          {/* GRILLE DE RÉSULTATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
            {filteredResults.map(p => (
              <Link href={`/products/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
                <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: "150px", backgroundImage: `url(${p.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "8px", marginBottom: "15px" }}></div>
                  <h3 style={{ margin: "0 0 10px 0", color: "#0f172a", fontSize: "1.1rem" }}>{p.name}</h3>
                  <div style={{ color: "#2563eb", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "10px" }}>{p.price.toLocaleString()} €</div>
                  <div style={{ marginTop: "auto", fontSize: "0.85rem", color: p.inStock ? "#16a34a" : "#dc2626", fontWeight: "bold" }}>
                    {p.inStock ? "● En stock" : "○ Rupture de stock"}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredResults.length === 0 && (
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
  boxSizing: "border-box"
};