const CHECKOUT_STATE_KEY = "althea_checkout_state";

export function getCheckoutStateStore() {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(CHECKOUT_STATE_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function setCheckoutStateStore(nextState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHECKOUT_STATE_KEY, JSON.stringify(nextState));
}
