"use client";
import { useSearchParams } from "next/navigation";
import { mockCatalogData } from "../../services/mocks/catalog.mock";
import Link from "next/link";

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // 💡 NOUVEAU : Préparation des données (Catégorie spécifique OU Tout le catalogue)
  let displayData = {
    name: "Catalogue Complet",
    description: "Découvrez l'ensemble de notre matériel médical et chirurgical de haute technologie.",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200", // Image générique d'hôpital
    products: []
  };

  // Si on cherche une catégorie précise et qu'elle existe
  if (categoryParam && mockCatalogData[categoryParam]) {
    displayData = mockCatalogData[categoryParam];
  } 
  // Sinon, on regroupe TOUS les produits de TOUTES les catégories
  else {
    for (const key in mockCatalogData) {
      displayData.products = [...displayData.products, ...mockCatalogData[key].products];
    }
  }

  /* 🧠 ALGORITHME DE TRI SELON LE CAHIER DES CHARGES */
  const sortedProducts = [...displayData.products].sort((a, b) => {
    // Règle 1 : Les produits épuisés vont TOUT À LA FIN
    if (a.inStock && !b.inStock) return -1; // 'a' passe devant
    if (!a.inStock && b.inStock) return 1;  // 'b' passe devant

    // Règle 2 & 3 : Tri par priorité (si les deux ont le même stock)
    const priorityA = a.priority || 999;
    const priorityB = b.priority || 999;

    return priorityA - priorityB;
  });

  return (
    <main style={{ fontFamily: 'sans-serif', backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "60px" }}>
      
      {/* 🖼️ IMAGE PRINCIPALE & SURIMPRESSION */}
      <section style={{ 
        position: "relative", height: "300px", 
        backgroundImage: `url(${displayData.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(15, 23, 42, 0.6)" }}></div>
        <h1 style={{ position: "relative", color: "white", fontSize: "3rem", fontWeight: "bold", margin: 0, textShadow: "0 4px 6px rgba(0,0,0,0.5)", textAlign: "center" }}>
          {displayData.name}
        </h1>
      </section>

      {/* 📝 DESCRIPTION DE LA CATÉGORIE / CATALOGUE */}
      <section style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px", textAlign: "center" }}>
        <p style={{ fontSize: "1.2rem", color: "#475569", lineHeight: "1.8" }}>
          {displayData.description}
        </p>
      </section>

      {/* 🛍️ AFFICHAGE DES PRODUITS TRIÉS */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" }}>
          {sortedProducts.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} style={{ textDecoration: "none" }}>
              <div style={{ 
                backgroundColor: "white", borderRadius: "16px", overflow: "hidden", 
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                opacity: product.inStock ? 1 : 0.6, filter: product.inStock ? "none" : "grayscale(50%)",
                display: "flex", flexDirection: "column", height: "100%",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={(e) => { if(product.inStock) e.currentTarget.style.transform = "translateY(-5px)" }}
              onMouseLeave={(e) => { if(product.inStock) e.currentTarget.style.transform = "translateY(0)" }}
              >
                <div style={{ height: "200px", backgroundImage: `url(${product.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h2 style={{ fontSize: "1.3rem", color: "#0f172a", fontWeight: "bold", marginBottom: "10px", margin: 0 }}>
                    {product.name}
                  </h2>
                  <span style={{ fontSize: "1.2rem", color: "#2563eb", fontWeight: "bold", marginBottom: "15px" }}>
                    {product.price.toLocaleString('fr-FR')} €
                  </span>

                  {!product.inStock && (
                    <div style={{ marginTop: "auto", padding: "8px", backgroundColor: "#fee2e2", color: "#ef4444", fontWeight: "bold", textAlign: "center", borderRadius: "8px", fontSize: "0.9rem" }}>
                      En rupture de stock
                    </div>
                  )}

                  {product.inStock && (
                    <button style={{ marginTop: "auto", backgroundColor: "#0f172a", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
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