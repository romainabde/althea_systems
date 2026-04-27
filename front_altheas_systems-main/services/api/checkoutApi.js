import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";
import { checkoutStateMock, checkoutSummaryMock } from "../mocks/checkout.mock";

let mockCheckoutState = structuredClone(checkoutStateMock);

export async function initCheckout(payload = {}) {
  if (API_CONFIG.useMocks) {
    mockCheckoutState = {
      ...mockCheckoutState,
      step: "customer",
      ...payload,
    };
    return mockCheckoutState;
  }

  return httpClient(API_ROUTES.checkout.init, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCheckoutState() {
  if (API_CONFIG.useMocks) {
    return mockCheckoutState;
  }
  return httpClient(API_ROUTES.checkout.state);
}

export async function fetchCheckoutSummary() {
  if (API_CONFIG.useMocks) {
    return checkoutSummaryMock;
  }
  return httpClient(API_ROUTES.checkout.summary);
}

export async function confirmCheckout(payload = {}) {
  if (API_CONFIG.useMocks) {
    return {
      success: true,
      orderId: "order_001",
      status: "paid",
      ...payload,
    };
  }

  return httpClient(API_ROUTES.checkout.confirm, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
