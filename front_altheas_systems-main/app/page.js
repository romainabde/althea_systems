"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { mockHomeData } from "../services/mocks/home.mock";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselData = mockHomeData.carousel || [];

  useEffect(() => {
    if (carouselData.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselData.length]);

  return (
    <main style={{ fontFamily: 'sans-serif' }}>
      
      {/* 🎠 CARROUSEL DYNAMIQUE */}
      <section style={{ position: "relative", height: "500px", overflow: "hidden", backgroundColor: "#0f172a" }}>
        {carouselData.map((slide, index) => (
          <div 
            key={slide.id}
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.4)), url(${slide.imageUrl})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: currentSlide === index ? 1 : 0, transition: "opacity 0.8s ease-in-out",
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", color: "white"
            }}
          >
            <h1 style={{ fontSize: "3.5rem", fontWeight: "bold", marginBottom: "15px" }}>{slide.title}</h1>
            <p style={{ fontSize: "1.2rem", marginBottom: "30px", maxWidth: "600px" }}>{slide.subtitle}</p>
            <Link href={slide.link}>
              <button style={{ backgroundColor: "#2563eb", color: "white", padding: "15px 30px", fontSize: "1.1rem", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                {slide.buttonText}
              </button>
            </Link>
          </div>
        ))}
      </section>

      {/* 📝 TEXTE DE BIENVENUE FIXE */}
      <section style={{ backgroundColor: "#f8fafc", padding: "50px 20px", textAlign: "center", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "20px", fontWeight: "bold" }}>
            {mockHomeData.welcomeMessage?.title}
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#475569", lineHeight: "1.8" }}>
            {mockHomeData.welcomeMessage?.content}
          </p>
        </div>
      </section>

      {/* 🗂️ GRILLE DES CATÉGORIES */}
      <section style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "30px", fontWeight: "bold", textAlign: "center" }}>
          Nos Catégories d'Équipements
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          {/* On trie les catégories par ordre avant de les afficher */}
          {mockHomeData.categories && [...mockHomeData.categories].sort((a, b) => a.order - b.order).map((category) => (
            <Link href={category.link} key={category.id} style={{ textDecoration: "none", display: "block" }}>
              <div style={{ 
                position: "relative", 
                height: "250px", 
                borderRadius: "16px", 
                overflow: "hidden", 
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {/* CALQUE 1 : L'IMAGE DE FOND */}
                <div style={{ 
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1,
                  backgroundImage: `url(${category.imageUrl})`, 
                  backgroundSize: "cover", backgroundPosition: "center",
                  transition: "transform 0.5s ease"
                }}></div>
                
                {/* CALQUE 2 : LE FILTRE SOMBRE ET LE TEXTE */}
                <div style={{ 
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2,
                  backgroundColor: "rgba(15, 23, 42, 0.4)",
                  display: "flex", alignItems: "flex-end", padding: "25px",
                  boxSizing: "border-box" /* 👈 VOILÀ LA MAGIE QUI RÉPARE TOUT ! */
                }}>
                  <h3 style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                    {category.name} →
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 🛍️ SECTION DES PRODUITS PHARES */}
      <section style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "2rem", color: "#0f172a", marginBottom: "30px", fontWeight: "bold", textAlign: "center" }}>
          Les Top Produits du moment
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
          {mockHomeData.topProducts && mockHomeData.topProducts.map((product) => (
            <div key={product.id} style={{ 
              borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", backgroundColor: "white", transition: "transform 0.3s ease", cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ height: "200px", backgroundImage: `url(${product.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a", fontWeight: "bold" }}>{product.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}