/**
 * Snapshot lecture seule pour les écrans qui n’ont pas accès au CartContext.
 * Alimenté par CartContext après chaque sync API (clés althea_cart + cart).
 */
export function getCart() {
  if (typeof window === "undefined") return [];

  const raw =
    localStorage.getItem("althea_cart") || localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

/**
 * @deprecated Préférer useCart().addToCart — sinon le serveur n’est pas à jour.
 */
export function addToCart(product) {
  if (typeof window === "undefined") return;

  console.warn(
    "[cart] utils/addToCart est obsolète : utilisez useCart() depuis un composant client."
  );

  const cart = getCart();
  const existingProduct = cart.find((item) => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      inStock: product.inStock,
      quantity: 1,
    });
  }

  const serialized = JSON.stringify(cart);
  localStorage.setItem("cart", serialized);
  localStorage.setItem("althea_cart", serialized);
}

/**
 * @deprecated Préférer useCart().removeFromCart.
 */
export function removeFromCart(productId) {
  if (typeof window === "undefined") return;

  console.warn(
    "[cart] utils/removeFromCart est obsolète : utilisez useCart() depuis un composant client."
  );

  const cart = getCart().filter((item) => item.id !== productId);
  const serialized = JSON.stringify(cart);
  localStorage.setItem("cart", serialized);
  localStorage.setItem("althea_cart", serialized);
}
