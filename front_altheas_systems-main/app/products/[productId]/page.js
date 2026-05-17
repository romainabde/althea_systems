"use client";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { mockCatalogData } from "../../../services/mocks/catalog.mock";
// 🛒 LIGNE AJOUTÉE : On importe le moteur du panier
import { useCart } from "../../../context/CartContext";

export default function ProductPage() {
  const params = useParams();
  const pathname = usePathname();
  
  // 🛒 LIGNE AJOUTÉE : On récupère la fonction pour ajouter au panier
  const { addToCart } = useCart();

  const productId = params?.productid || pathname.split("/").pop();

  let product = null;
  let categoryProducts = [];

  if (mockCatalogData) {
    for (const key in mockCatalogData) {
      const found = mockCatalogData[key].products.find((p) => p.id === productId);
      if (found) {
        product = found;
        categoryProducts = mockCatalogData[key].products;
        break;
      }
    }
  }

  if (!product) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "20px" }}>Produit introuvable.</h1>
        <p>L'ID recherché était : {productId}</p>
        <Link href="/products?category=Imagerie" style={{ color: "#2563eb", textDecoration: "underline" }}>
          Retourner au catalogue
        </Link>
      </div>
    );
  }

  const images = product.images || [
    product.imageUrl,
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600", 
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600"  
  ];
  const [currentImage, setCurrentImage] = useState(images[0]);

  const fullDescription = product.fullDescription || "Ce produit de haute technologie offre une fiabilité et une précision inégalées pour votre établissement de santé. Conçu avec des matériaux de qualité supérieure, il garantit une durabilité maximale et répond aux normes de sécurité les plus strictes de l'industrie médicale.";
  
  const techSpecs = product.technicalSpecs || [
    "Alimentation : 220V - 240V",
    "Garantie constructeur : 5 ans",
    "Certification : ISO 13485 (Dispositifs médicaux)",
    "Poids : 45 kg",
    "Connectivité : Wi-Fi, Bluetooth, Ethernet"
  ];

  const similarProducts = categoryProducts
    .filter(p => p.id !== product.id) 
    .sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return 0.5 - Math.random();
    })
    .slice(0, 6);

  return (
    <main style={{ fontFamily: 'sans-serif', backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "60px" }}>
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <Link href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }} style={{ color: "#475569", textDecoration: "none", fontWeight: "bold" }}>
          ← Retour au catalogue
        </Link>
      </div>

      <section style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "50px" }}>
        
        <div>
          <div style={{ width: "100%", height: "400px", backgroundImage: `url(${currentImage})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", transition: "background-image 0.3s ease-in-out" }}></div>
          
          <div style={{ display: "flex", gap: "15px", marginTop: "20px", overflowX: "auto" }}>
            {images.map((img, index) => (
              <div 
                key={index} 
                onClick={() => setCurrentImage(img)}
                style={{ 
                  width: "80px", height: "80px", backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center", 
                  borderRadius: "8px", cursor: "pointer", 
                  border: currentImage === img ? "3px solid #2563eb" : "2px solid transparent",
                  opacity: currentImage === img ? 1 : 0.6,
                  transition: "all 0.2s ease"
                }}
              ></div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "2.5rem", color: "#0f172a", fontWeight: "bold", margin: "0 0 10px 0" }}>
            {product.name}
          </h1>
          
          <div style={{ fontSize: "2rem", color: "#2563eb", fontWeight: "bold", marginBottom: "20px" }}>
            {product.price.toLocaleString('fr-FR')} € <span style={{ fontSize: "1rem", color: "#64748b", fontWeight: "normal" }}>HT</span>
          </div>

          <div style={{ marginBottom: "30px" }}>
            {product.inStock ? (
              <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.9rem" }}>
                ✓ En Stock - Prêt à être expédié
              </span>
            ) : (
              <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "8px 15px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.9rem" }}>
                ✗ Rupture de Stock
              </span>
            )}
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#0f172a", fontWeight: "bold", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>
              Description du produit
            </h3>
            <p style={{ color: "#475569", lineHeight: "1.7", fontSize: "1.05rem" }}>
              {fullDescription}
            </p>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "#0f172a", fontWeight: "bold", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px", marginBottom: "15px" }}>
              Caractéristiques Techniques
            </h3>
            <ul style={{ color: "#475569", lineHeight: "1.8", paddingLeft: "20px" }}>
              {techSpecs.map((spec, index) => (
                <li key={index}>{spec}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
            
            {/* 🛒 LIGNE MODIFIÉE : On ajoute onClick={() => addToCart(product)} */}
            <button 
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
              style={{ 
                backgroundColor: product.inStock ? "#2563eb" : "#cbd5e1",
                color: "white", padding: "18px", fontSize: "1.2rem", fontWeight: "bold", borderRadius: "12px", border: "none", 
                cursor: product.inStock ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                boxShadow: product.inStock ? "0 4px 10px rgba(37, 99, 235, 0.3)" : "none"
              }}
              onMouseEnter={(e) => { if(product.inStock) e.currentTarget.style.transform = "scale(1.02)" }}
              onMouseLeave={(e) => { if(product.inStock) e.currentTarget.style.transform = "scale(1)" }}
            >
              {product.inStock ? "🛒 Ajouter au panier" : "En rupture de stock"}
            </button>

            {product.inStock && (
              <button 
                style={{ 
                  backgroundColor: "transparent", 
                  color: "#2563eb", padding: "12px", fontSize: "1rem", fontWeight: "bold", borderRadius: "12px", border: "2px solid #2563eb", 
                  cursor: "pointer", transition: "all 0.3s ease" 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff" }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
              >
                📅 Entamer une période d'essai ou s'abonner
              </button>
            )}
            
          </div>
        </div>
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "60px auto", maxWidth: "1200px" }} />

      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "1.8rem", color: "#0f172a", fontWeight: "bold", marginBottom: "30px" }}>
          Vous pourriez aussi être intéressé par...
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" }}>
          {similarProducts.map((simProduct) => (
            <Link href={`/products/${simProduct.id}`} key={simProduct.id} style={{ textDecoration: "none" }}>
              <div style={{ 
                backgroundColor: "white", borderRadius: "12px", overflow: "hidden", 
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                opacity: simProduct.inStock ? 1 : 0.6, filter: simProduct.inStock ? "none" : "grayscale(50%)",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={(e) => { if(simProduct.inStock) e.currentTarget.style.transform = "translateY(-5px)" }}
              onMouseLeave={(e) => { if(simProduct.inStock) e.currentTarget.style.transform = "translateY(0)" }}
              >
                <div style={{ height: "160px", backgroundImage: `url(${simProduct.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                <div style={{ padding: "15px" }}>
                  <h3 style={{ fontSize: "1.1rem", color: "#0f172a", fontWeight: "bold", margin: "0 0 10px 0" }}>{simProduct.name}</h3>
                  <span style={{ fontSize: "1.1rem", color: "#2563eb", fontWeight: "bold" }}>{simProduct.price.toLocaleString('fr-FR')} €</span>
                  {!simProduct.inStock && (
                    <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "#ef4444", fontWeight: "bold" }}>Rupture de stock</div>
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