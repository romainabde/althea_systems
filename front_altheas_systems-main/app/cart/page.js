"use client";
import { useCart } from "../../context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotalHT, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Votre panier est vide</h1>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Vous n'avez sélectionné aucun matériel médical pour le moment.</p>
        <Link href="/products" style={{ backgroundColor: "#0f172a", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none" }}>
          Découvrir le catalogue
        </Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: "2.2rem", fontWeight: "bold", marginBottom: "40px" }}>Récapitulatif de votre Panier</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {cart.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "80px", height: "80px", backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "8px" }}></div>
              <div>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{item.name}</h3>
                
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0" }}>
                  {/* Bouton MOINS */}
                  <button 
                    onClick={() => updateQuantity(item.id, -1)} 
                    style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}
                  >
                    -
                  </button>
                  
                  <span style={{ fontWeight: "bold", color: "#0f172a", width: "20px", textAlign: "center" }}>
                    {item.quantity}
                  </span>
                  
                  {/* Bouton PLUS avec sécurité de Stock Maximum 💡 */}
                  <button 
                    onClick={() => updateQuantity(item.id, 1)} 
                    disabled={item.quantity >= (item.stockQuantity || 1)}
                    style={{ 
                      width: "28px", height: "28px", borderRadius: "50%", 
                      border: "1px solid #cbd5e1", 
                      backgroundColor: item.quantity >= (item.stockQuantity || 1) ? "#e2e8f0" : "#f8fafc", 
                      cursor: item.quantity >= (item.stockQuantity || 1) ? "not-allowed" : "pointer", 
                      fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", 
                      color: item.quantity >= (item.stockQuantity || 1) ? "#94a3b8" : "#475569" 
                    }}
                    title={item.quantity >= (item.stockQuantity || 1) ? `Stock max atteint (${item.stockQuantity} en stock)` : "Ajouter un article"}
                  >
                    +
                  </button>
                </div>

                <p style={{ fontWeight: "bold", color: "#2563eb", margin: 0 }}>{item.price.toLocaleString()} € HT / unité</p>
              </div>
            </div>

            <button 
                onClick={() => removeFromCart(item.id)}
                style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>
                Supprimer
            </button>
          </div>
        ))}
      </div>

      {/* Résumé final */}
      <div style={{ marginTop: "40px", padding: "30px", backgroundColor: "#f8fafc", borderRadius: "16px", textAlign: "right" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#64748b", marginBottom: "10px" }}>Total de la commande (HT)</h2>
        <p style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#0f172a", marginBottom: "30px" }}>{(cartTotalHT || 0).toLocaleString()} €</p>
        
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}>
            <button onClick={clearCart} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "bold", color: "#475569" }}>
                Vider le panier
            </button>
            <Link href="/checkout" style={{ padding: "12px 30px", borderRadius: "8px", background: "#2563eb", color: "white", textDecoration: "none", fontWeight: "bold" }}>
                Passer à l'étape suivante →
            </Link>
        </div>
      </div>
    </main>
  );
}