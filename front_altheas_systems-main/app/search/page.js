"use client";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mockCatalogData } from "../../services/mocks/catalog.mock"; // Les {} sont importantes ici !

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";

  // On prépare la liste plate de tous les produits
  const allProducts = useMemo(() => {
    let list = [];
    if (!mockCatalogData) return [];
    for (const key in mockCatalogData) {
      const cat = mockCatalogData[key];
      list = [...list, ...cat.products.map(p => ({
        ...p,
        categoryName: cat.name,
        categoryKey: key
      }))];
    }
    return list;
  }, []);

  const [searchTitle, setSearchTitle] = useState(initialQuery);

  const filteredResults = useMemo(() => {
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(searchTitle.toLowerCase())
    );
  }, [allProducts, searchTitle]);

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#0f172a" }}>Recherche : {searchTitle || "Tous les produits"}</h1>
        
        <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
          <aside style={{ width: "250px", background: "white", padding: "20px", borderRadius: "12px", height: "fit-content", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <input 
              type="text" 
              placeholder="Filtrer..." 
              value={searchTitle} 
              onChange={(e) => setSearchTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            />
            <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>{filteredResults.length} résultats</p>
          </aside>

          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
            {filteredResults.map(p => (
              <div key={p.id} style={{ background: "white", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <img src={p.imageUrl} alt={p.name} style={{ width: "100%", borderRadius: "8px" }} />
                <h3 style={{ fontSize: "1rem", margin: "10px 0" }}>{p.name}</h3>
                <p style={{ color: "#2563eb", fontWeight: "bold" }}>{p.price.toLocaleString()} €</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SearchContent />
    </Suspense>
  );
}