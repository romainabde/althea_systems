import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";
import { cartMock, computeCartTotals } from "../mocks/cart.mock";
import { buildIdentityHeaders } from "../auth/session";

let mockCart = structuredClone(cartMock);

function normalizeCartResponse(data) {
  const items = Array.isArray(data?.items)
    ? data.items.map((item) => ({
        id: item.productId,
        name: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
        inStock: (item.availableStock || 0) > 0,
      }))
    : [];

  return {
    items,
    totals: {
      subtotal: data?.cartTotal ?? 0,
      total: data?.cartTotal ?? 0,
    },
  };
}

export async function fetchCart() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.cart) {
    return {
      ...mockCart,
      totals: computeCartTotals(mockCart.items),
    };
  }

  const data = await httpClient(API_ROUTES.cart.get, {
    headers: buildIdentityHeaders(),
  });
  return normalizeCartResponse(data);
}

export async function addCartItem(payload) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.cart) {
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
    headers: buildIdentityHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(itemId, payload) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.cart) {
    mockCart.items = mockCart.items.map((item) =>
      item.id === Number(itemId) ? { ...item, quantity: payload.quantity } : item
    );
    return fetchCart();
  }

  return httpClient(API_ROUTES.cart.updateItem(itemId), {
    method: "PUT",
    headers: buildIdentityHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function deleteCartItem(itemId) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.cart) {
    mockCart.items = mockCart.items.filter((item) => item.id !== Number(itemId));
    return fetchCart();
  }

  return httpClient(API_ROUTES.cart.deleteItem(itemId), {
    method: "DELETE",
    headers: buildIdentityHeaders(),
  });
}
