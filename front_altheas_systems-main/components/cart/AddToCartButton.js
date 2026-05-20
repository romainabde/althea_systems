"use client";

import { useCart } from "../../context/CartContext";

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    const ok = await addToCart(product);
    if (ok) alert("Produit ajouté au panier");
  };

  return (
    <button
      type="button"
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
