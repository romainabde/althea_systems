export const checkoutStateMock = {
  checkoutId: "chk_guest_001",
  step: "customer",
  customerMode: "guest",
  addresses: [],
  selectedAddressId: null,
  paymentMethods: [],
  selectedPaymentMethodId: null,
};

export const checkoutSummaryMock = {
  items: [
    { id: 101, name: "Scanner médical", quantity: 1, unitPrice: 1200 },
    { id: 202, name: "Bistouri électrique", quantity: 2, unitPrice: 600 },
  ],
  subtotal: 2400,
  tax: 480,
  total: 2880,
};
