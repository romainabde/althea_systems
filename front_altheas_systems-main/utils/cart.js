export function getCart() {
  if (typeof window === "undefined") return [];

  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(product) {
  if (typeof window === "undefined") return;

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

  localStorage.setItem("cart", JSON.stringify(cart));
}

export function removeFromCart(productId) {
  if (typeof window === "undefined") return;

  const cart = getCart().filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
}