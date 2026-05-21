/** TVA affichée dans le panier et le checkout (20 %). */
export const VAT_RATE = 0.2;

/** Montant TTC à partir d'un total HT. */
export function amountHTToTTC(ht) {
  return Number(ht ?? 0) * (1 + VAT_RATE);
}

/** Montant TVA à partir d'un total HT. */
export function amountVAT(ht) {
  return Number(ht ?? 0) * VAT_RATE;
}

/** Format monétaire fr-FR (2 décimales). */
export function formatEuro(amount) {
  return Number(amount ?? 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
