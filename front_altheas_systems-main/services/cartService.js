import { addCartItem, deleteCartItem, fetchCart, updateCartItem } from "./api/cartApi";

export async function getCart() {
  return fetchCart();
}

export async function addProductToCart(product, quantity = 1) {
  await addCartItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity,
  });
  return fetchCart();
}

export async function changeCartItemQuantity(itemId, quantity) {
  await updateCartItem(itemId, { quantity });
  return fetchCart();
}

export async function removeProductFromCart(itemId) {
  await deleteCartItem(itemId);
  return fetchCart();
}
