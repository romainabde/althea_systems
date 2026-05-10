"use client";
import { use } from "react";
import Link from "next/link";
import { mockCatalogData } from "../../../services/mocks/catalog.mock";

export default function ProductDetailPage({ params }) {
  // 👇 On utilise productId car c'est le nom de TON dossier !
  const unwrappedParams = use(params);
  const productId = parseInt(unwrappedParams.productId);

  // Le robot qui cherche le bon produit dans tout le fichier centralisé
  let product = null;
  for (const key in mockCatalogData) {
    const found = mockCatalogData[key].products.find(p => p.id === productId);
    if (found) {
      product = found;
      break;
    }
  }

  if (!product) {
    return <div style={{ padding: "100px", textAlign: "center", fontSize: "1.5rem" }}>Produit introuvable 😔</div>;
  }

  return (
    <main style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <Link href="/products" style={{ color: "#64748b", textDecoration: "none", fontWeight: "bold" }}>
        ← Retour au catalogue
      </Link>
      
      <div style={{ display: "flex", gap: "50px", marginTop: "30px", flexWrap: "wrap" }}>
        <img src={product.imageUrl} alt={product.name} style={{ width: "400px", height: "400px", objectFit: "cover", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }} />
        
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h1 style={{ marginTop: 0, color: "#0f172a", fontSize: "2.5rem" }}>{product.name}</h1>
          <p style={{ fontSize: "2rem", color: "#2563eb", fontWeight: "bold", margin: "10px 0" }}>
            {product.price.toLocaleString("fr-FR")} €
          </p>
          
          <div style={{ margin: "20px 0", padding: "10px 15px", backgroundColor: product.inStock ? "#dcfce7" : "#fee2e2", color: product.inStock ? "#16a34a" : "#dc2626", display: "inline-block", borderRadius: "20px", fontWeight: "bold" }}>
            {product.inStock ? "● En stock" : "○ Rupture de stock"}
          </div>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#475569" }}>{product.fullDescription}</p>
          
          <h3 style={{ marginTop: "30px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>Caractéristiques techniques</h3>
          <ul style={{ paddingLeft: "20px", color: "#334155" }}>
            {product.technicalSpecs?.map((spec, i) => <li key={i} style={{ marginBottom: "8px" }}>{spec}</li>)}
          </ul>

          <button style={{ width: "100%", padding: "15px", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", marginTop: "30px" }}>
            Ajouter au panier
          </button>
        </div>
      </div>
    </main>
  );
}