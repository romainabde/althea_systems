"use client"; // Nécessaire pour afficher le compteur du panier en temps réel
import Link from "next/link";
import Image from "next/image";
import DesktopFooter from "../components/layout/DesktopFooter";
import ChatWidget from "../components/chat/ChatWidget";
import HeaderSearchBar from "../components/layout/HeaderSearchBar";
// 🛒 Import du Context et du Hook pour le compteur
import { CartProvider, useCart } from "../context/CartContext";

// Petit composant interne pour gérer le lien du panier avec son badge
function NavCartLink() {
  const { cart } = useCart();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link href="/cart" style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
      Panier
      {itemCount > 0 && (
        <span style={{
          backgroundColor: "#ef4444",
          color: "white",
          fontSize: "0.75rem",
          fontWeight: "bold",
          padding: "2px 6px",
          borderRadius: "10px",
          minWidth: "15px",
          textAlign: "center"
        }}>
          {itemCount}
        </span>
      )}
    </Link>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>
        {/* 🛒 CartProvider enveloppe tout pour que l'état du panier soit partagé */}
        <CartProvider>
          
          <header style={{ 
            padding: "1rem 2rem", 
            background: "#003d5c", 
            color: "white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            position: "sticky", 
            top: 0, 
            zIndex: 1000
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                <Image
                  src="/images/logo.png"
                  alt="Althea Systems"
                  width={160}
                  height={40}
                  priority
                  style={{ width: "auto", height: "40px" }}
                />
              </Link>
              
              <HeaderSearchBar />
            </div>
            
            <nav style={{ 
              marginTop: "1rem", 
              display: "flex", 
              gap: "2rem", 
              borderTop: "1px solid rgba(255,255,255,0.1)", 
              paddingTop: "1rem",
              fontWeight: "500"
            }}>
              <Link href="/" style={{ color: "white", textDecoration: "none" }}>Accueil</Link>
              <Link href="/products" style={{ color: "white", textDecoration: "none" }}>Catalogue</Link>
              <Link href="/search" style={{ color: "white", textDecoration: "none" }}>Recherche</Link>
              
              {/* Utilisation du lien dynamique avec compteur */}
              <NavCartLink />
              
              <Link href="/account" style={{ color: "white", textDecoration: "none" }}>Compte</Link>
            </nav>
          </header>

          <main style={{ minHeight: "calc(100vh - 200px)" }}>
            {children}
          </main>

          <DesktopFooter />
          <ChatWidget />

        </CartProvider>
      </body>
    </html>
  );
}