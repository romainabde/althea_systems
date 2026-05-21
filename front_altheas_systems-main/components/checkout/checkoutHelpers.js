/** Utilitaires partagés checkout / reprise paiement. */

export function formatBrand(brand) {
  const value = String(brand || "carte").toLowerCase();
  if (value === "visa") return "Visa";
  if (value === "mastercard") return "Mastercard";
  if (value === "amex") return "American Express";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatExpiry(expMonth, expYear) {
  const month = String(expMonth || "").padStart(2, "0");
  const year = String(expYear || "");
  const shortYear = year.length >= 2 ? year.slice(-2) : year;
  return `${month}/${shortYear}`;
}

export function formatAddressLines(addr) {
  if (!addr) return "";
  const lines = [
    [addr.firstName, addr.lastName].filter(Boolean).join(" "),
    addr.street,
    [addr.zipCode, addr.city].filter(Boolean).join(" "),
    addr.country,
    addr.phone ? `Tél : ${addr.phone}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function countryToStripeCode(country) {
  const value = String(country || "").trim().toLowerCase();
  if (!value || value === "france" || value === "fr") return "FR";
  if (value.length === 2) return value.toUpperCase();
  return "FR";
}

export function buildBillingDetails(address, authUser) {
  const name = [address?.firstName, address?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    name: name || undefined,
    email: authUser?.email || undefined,
    phone: address?.phone || undefined,
    address: {
      line1: address?.street || undefined,
      city: address?.city || undefined,
      postal_code: address?.zipCode || undefined,
      country: countryToStripeCode(address?.country),
    },
  };
}
