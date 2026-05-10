"use client";
import Link from "next/link";
import { mockCatalogData } from "../../services/mocks/catalog.mock";

export default function CatalogPage() {
  // On récupère toutes les clés (imagerie, mobilier, etc.)
  const categories = Object.keys(mockCatalogData);

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#0f172a" }}>Notre Catalogue</h1>
      
      <div style={{ display: "grid", gap: "40px", marginTop: "30px" }}>
        {categories.map(key => (
          <section key={key}>
            <h2 style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", color: "#1e293b" }}>
              {mockCatalogData[key].name}
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginTop: "20px" }}>
              {mockCatalogData[key].products.map(product => (
                <Link href={`/products/${product.id}`} key={product.id} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ border: "1px solid #f1f5f9", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", background: "white", height: "100%" }}>
                    <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
                    <h4 style={{ margin: "15px 0 10px", fontSize: "1.1rem" }}>{product.name}</h4>
                    {/* 👇 Le "fr-FR" est ici pour éviter l'erreur rouge ! */}
                    <p style={{ fontWeight: "bold", color: "#2563eb", fontSize: "1.2rem", margin: 0 }}>
                      {product.price.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}