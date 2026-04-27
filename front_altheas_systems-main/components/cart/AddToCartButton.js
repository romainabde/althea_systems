"use client";

import { addToCart, getCart } from "../../utils/cart";

export default function AddToCartButton({ product }) {
  const handleAddToCart = () => {
    addToCart(product);
    console.log("Panier après ajout :", getCart());
    alert("Produit ajouté au panier");
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!product.inStock}
      style={{
        marginTop: "2rem",
        padding: "0.8rem 1.2rem",
        border: "none",
        borderRadius: "8px",
        background: product.inStock ? "#00a8b5" : "#ccc",
        color: "white",
        cursor: product.inStock ? "pointer" : "not-allowed",
      }}
    >
      {product.inStock ? "Ajouter au panier" : "En rupture de stock"}
    </button>
  );
}