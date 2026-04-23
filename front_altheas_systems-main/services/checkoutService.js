import {
  confirmCheckout,
  fetchCheckoutState,
  fetchCheckoutSummary,
  initCheckout,
} from "./api/checkoutApi";

export async function startCheckout(payload) {
  return initCheckout(payload);
}

export async function getCheckoutState() {
  return fetchCheckoutState();
}

export async function getCheckoutSummary() {
  return fetchCheckoutSummary();
}

export async function placeOrder(payload) {
  return confirmCheckout(payload);
}
