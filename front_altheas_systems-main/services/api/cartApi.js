import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";
import { cartMock, computeCartTotals } from "../mocks/cart.mock";

let mockCart = structuredClone(cartMock);

export async function fetchCart() {
  if (API_CONFIG.useMocks) {
    return {
      ...mockCart,
      totals: computeCartTotals(mockCart.items),
    };
  }

  return httpClient(API_ROUTES.cart.get);
}

export async function addCartItem(payload) {
  if (API_CONFIG.useMocks) {
    const itemIndex = mockCart.items.findIndex((item) => item.id === payload.productId);
    if (itemIndex >= 0) {
      mockCart.items[itemIndex].quantity += payload.quantity || 1;
    } else {
      mockCart.items.push({
        id: payload.productId,
        name: payload.name || "Produit",
        price: payload.price || 0,
        quantity: payload.quantity || 1,
        inStock: true,
      });
    }
    return fetchCart();
  }

  return httpClient(API_ROUTES.cart.addItem, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(itemId, payload) {
  if (API_CONFIG.useMocks) {
    mockCart.items = mockCart.items.map((item) =>
      item.id === Number(itemId) ? { ...item, quantity: payload.quantity } : item
    );
    return fetchCart();
  }

  return httpClient(API_ROUTES.cart.updateItem(itemId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCartItem(itemId) {
  if (API_CONFIG.useMocks) {
    mockCart.items = mockCart.items.filter((item) => item.id !== Number(itemId));
    return fetchCart();
  }

  return httpClient(API_ROUTES.cart.deleteItem(itemId), {
    method: "DELETE",
  });
}
