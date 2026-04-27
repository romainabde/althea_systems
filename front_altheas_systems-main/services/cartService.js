import { addCartItem, deleteCartItem, fetchCart, updateCartItem } from "./api/cartApi";

export async function getCart() {
  return fetchCart();
}

export async function addProductToCart(product, quantity = 1) {
  return addCartItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity,
  });
}

export async function changeCartItemQuantity(itemId, quantity) {
  return updateCartItem(itemId, { quantity });
}

export async function removeProductFromCart(itemId) {
  return deleteCartItem(itemId);
}
