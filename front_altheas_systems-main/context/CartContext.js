"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  fetchCart as fetchCartApi,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCartAll,
} from "../services/api/cartApi";
import { getAuthToken } from "../services/authSession";

const CartContext = createContext();

function mirrorCartToStorage(items) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(items);
    localStorage.setItem("althea_cart", serialized);
    localStorage.setItem("cart", serialized);
  } catch {
    /* quota / private mode */
  }
}

export function CartProvider({ children }) {
  const pathname = usePathname();
  const [cart, setCart] = useState([]);
  const [cartTotalHT, setCartTotalHT] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState(null);

  const refreshCart = useCallback(async () => {
    try {
      setCartError(null);
      const { items, cartTotal } = await fetchCartApi();
      setCart(items);
      const ht =
        cartTotal ??
        items.reduce(
          (acc, item) =>
            item.inStock ? acc + item.price * item.quantity : acc,
          0
        );
      setCartTotalHT(ht);
      mirrorCartToStorage(items);
    } catch (e) {
      console.error(e);
      setCartError(e?.message ?? "Panier indisponible");
      setCart([]);
      setCartTotalHT(0);
      mirrorCartToStorage([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refreshCart();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, refreshCart]);

  /** @returns {Promise<boolean>} */
  const addToCart = async (product) => {
    try {
      setCartError(null);
      await addCartItem({
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
      });
      await refreshCart();
      return true;
    } catch (e) {
      setCartError(e?.message ?? "Impossible d'ajouter au panier");
      return false;
    }
  };

  const removeFromCart = async (id) => {
    try {
      setCartError(null);
      await deleteCartItem(id);
      await refreshCart();
    } catch (e) {
      setCartError(e?.message ?? "Erreur lors de la suppression");
    }
  };

  const clearCart = async () => {
    try {
      setCartError(null);
      await clearCartAll();
      await refreshCart();
    } catch (e) {
      setCartError(e?.message ?? "Impossible de vider le panier");
    }
  };

  const updateQuantity = async (id, delta) => {
    const item = cart.find((x) => x.id === id);
    if (!item) return;
    const max = item.stockQuantity ?? 999;
    const newQty = Math.max(1, Math.min(item.quantity + delta, max));
    if (newQty === item.quantity) return;
    try {
      setCartError(null);
      await updateCartItem(id, { quantity: newQty });
      await refreshCart();
    } catch (e) {
      setCartError(e?.message ?? "Mise à jour impossible");
    }
  };

  const isLoggedIn = !!getAuthToken();

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartError,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalHT,
        isLoggedIn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
