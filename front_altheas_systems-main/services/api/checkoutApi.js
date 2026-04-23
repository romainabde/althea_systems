import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";
import { checkoutStateMock, checkoutSummaryMock } from "../mocks/checkout.mock";
import { buildIdentityHeaders } from "../auth/session";
import { fetchCart } from "./cartApi";

let mockCheckoutState = structuredClone(checkoutStateMock);

export async function initCheckout(payload = {}) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.checkout) {
    mockCheckoutState = {
      ...mockCheckoutState,
      step: "customer",
      ...payload,
    };
    return mockCheckoutState;
  }

  return httpClient(API_ROUTES.checkout.init, {
    method: "POST",
    headers: buildIdentityHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function fetchCheckoutState() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.checkout) {
    return mockCheckoutState;
  }
  return fetchCart();
}

export async function fetchCheckoutSummary() {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.checkout) {
    return checkoutSummaryMock;
  }
  const cart = await fetchCart();
  return {
    items: cart.items,
    total: cart.totals?.total || 0,
  };
}

export async function confirmCheckout(payload = {}) {
  if (API_CONFIG.useMocks || API_CONFIG.useMocksByDomain?.checkout) {
    return {
      success: true,
      orderId: "order_001",
      status: "paid",
      ...payload,
    };
  }

  return httpClient(API_ROUTES.checkout.confirm, {
    method: "POST",
    headers: buildIdentityHeaders(),
    body: JSON.stringify(payload),
  });
}
