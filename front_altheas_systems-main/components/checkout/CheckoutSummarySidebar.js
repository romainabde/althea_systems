"use client";

export default function CheckoutSummarySidebar({ cart, cartTotalHT, orderTotal }) {
  const subtotal =
    orderTotal != null ? Number(orderTotal) : Number(cartTotalHT || 0);
  const taxes = subtotal * 0.2;
  const finalTotal = subtotal + taxes;

  const inStockItems = (cart || []).filter((item) => item.inStock !== false);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        height: "fit-content",
      }}
    >
      <h2
        style={{
          fontSize: "1.3rem",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "15px",
          marginBottom: "20px",
          marginTop: 0,
        }}
      >
        Résumé
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "20px",
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {inStockItems.length === 0 ? (
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>
            Panier vide
          </p>
        ) : (
          inStockItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.9rem",
                gap: "12px",
              }}
            >
              <span style={{ color: "#475569" }}>
                {item.quantity}x{" "}
                {(item.name || "Produit").length > 22
                  ? `${item.name.substring(0, 22)}…`
                  : item.name}
              </span>
              <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                {(item.price * item.quantity).toFixed(2)} €
              </span>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontSize: "0.95rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Sous-total HT</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>TVA (20%)</span>
          <span>{taxes.toFixed(2)} €</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#0f172a",
          }}
        >
          <span>Total TTC</span>
          <span>{finalTotal.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}
