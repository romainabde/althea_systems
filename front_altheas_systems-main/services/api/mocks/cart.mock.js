export const cartMock = {
  id: "guest-cart",
  items: [
    { id: 101, name: "Scanner médical", price: 1200, quantity: 1, inStock: true },
    { id: 202, name: "Bistouri électrique", price: 600, quantity: 2, inStock: true },
  ],
};

export function computeCartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.2).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return { subtotal, tax, total };
}
