"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoggedIn] = useState(false); // Simulation : à changer plus tard pour la connexion

  // Charger le panier au démarrage depuis le stockage du navigateur
  useEffect(() => {
    const savedCart = localStorage.getItem("althea_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Sauvegarder à chaque modification
  useEffect(() => {
    localStorage.setItem("althea_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => {
          // On vérifie le stock même à l'ajout direct
          const realMaxStock = item.stockQuantity || 1;
          const newQty = Math.min(item.quantity + 1, realMaxStock);
          return item.id === product.id ? { ...item, quantity: newQty } : item;
        });
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  // 💡 NOUVEAU : Fonction pour vider tout le panier d'un coup
  const clearCart = () => setCart([]);

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // 💡 On prend le VRAI stock depuis la BDD
          const realMaxStock = item.stockQuantity || 1;
          
          // La quantité ne peut pas descendre sous 1, ni dépasser le stock réel
          const newQty = Math.max(1, Math.min(item.quantity + delta, realMaxStock));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const cartTotalHT = cart.reduce((acc, item) => 
    item.inStock ? acc + item.price * item.quantity : acc, 0
  );

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotalHT, isLoggedIn 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);