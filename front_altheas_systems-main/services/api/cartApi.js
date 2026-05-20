import { API_CONFIG } from "../config";
import { httpClient } from "./http/client";
import { API_ROUTES } from "../routes";
import { cartMock, computeCartTotals } from "./mocks/cart.mock";

let mockCart = structuredClone(cartMock);

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600";

/**
 * Forme unifiée pour l’UI : réponse auth-cart-service ou mocks.
 * Back : { items: [{ productId, name, quantity, unitPrice, totalPrice, availableStock }], cartTotal }
 */
function normalizeCartPayload(raw) {
  if (!raw || !Array.isArray(raw.items)) {
    return { items: [], cartTotal: 0 };
  }

  const items = raw.items.map((row) => {
    const pid = row.productId ?? row.id;
    const price = Number(row.unitPrice ?? row.price ?? 0);
    const qty = Number(row.quantity ?? 1);
    const stock = Number(row.availableStock ?? row.stockQuantity ?? 999);

    return {
      id: pid,
      productId: pid,
      name: row.name ?? `Produit ${pid}`,
      price,
      quantity: qty,
      inStock: row.inStock !== false && stock > 0,
      stockQuantity: Math.max(stock, 1),
      imageUrl: row.imageUrl ?? PLACEHOLDER_IMG,
    };
  });

  const computedTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartTotal = Number(raw.cartTotal ?? computedTotal);

  return { items, cartTotal };
}

async function loadCartNormalized() {
  if (API_CONFIG.useMocks) {
    const totals = computeCartTotals(mockCart.items);
    return normalizeCartPayload({
      items: mockCart.items,
      cartTotal: totals.subtotal,
    });
  }

  const raw = await httpClient(API_ROUTES.cart.get);
  return normalizeCartPayload(raw);
}

export async function fetchCart() {
  return loadCartNormalized();
}

export async function addCartItem(payload) {
  const productId = payload.productId ?? payload.id;
  const quantity = payload.quantity ?? 1;

  if (API_CONFIG.useMocks) {
    const itemIndex = mockCart.items.findIndex((item) => item.id === productId);
    if (itemIndex >= 0) {
      mockCart.items[itemIndex].quantity += quantity;
    } else {
      mockCart.items.push({
        id: productId,
        name: payload.name || "Produit",
        price: payload.price || 0,
        quantity,
        inStock: true,
      });
    }
    return loadCartNormalized();
  }

  await httpClient(API_ROUTES.cart.addItem, {
    method: "POST",
    body: JSON.stringify({
      productId: Number(productId),
      quantity: Number(quantity),
    }),
  });

  return loadCartNormalized();
}

export async function updateCartItem(itemId, payload) {
  const pid = Number(itemId);

  if (API_CONFIG.useMocks) {
    mockCart.items = mockCart.items.map((item) =>
      item.id === pid ? { ...item, quantity: payload.quantity } : item
    );
    return loadCartNormalized();
  }

  await httpClient(API_ROUTES.cart.updateItem(pid), {
    method: "PUT",
    body: JSON.stringify({ quantity: payload.quantity }),
  });

  return loadCartNormalized();
}

export async function deleteCartItem(itemId) {
  const pid = Number(itemId);

  if (API_CONFIG.useMocks) {
    mockCart.items = mockCart.items.filter((item) => item.id !== pid);
    return loadCartNormalized();
  }

  await httpClient(API_ROUTES.cart.deleteItem(pid), {
    method: "DELETE",
  });

  return loadCartNormalized();
}

/** Pas de route /clear côté Node : suppression ligne par ligne. */
export async function clearCartAll() {
  if (API_CONFIG.useMocks) {
    mockCart.items = [];
    return loadCartNormalized();
  }

  const snapshot = await loadCartNormalized();
  const ids = snapshot.items.map((i) => i.productId ?? i.id);
  await Promise.all(
    ids.map((id) =>
      httpClient(API_ROUTES.cart.deleteItem(Number(id)), {
        method: "DELETE",
      })
    )
  );

  return loadCartNormalized();
}
