import Link from "next/link";

const pageStyle = {
  padding: "1rem",
  maxWidth: "760px",
  margin: "0 auto",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const ordersMock = [
  {
    id: "CMD-2026-001",
    productName: "Scanner médical",
    date: "2026-04-20",
    amount: 1200,
    status: "Livrée",
  },
  {
    id: "CMD-2026-002",
    productName: "Laser chirurgical",
    date: "2026-04-21",
    amount: 950,
    status: "En préparation",
  },
  {
    id: "CMD-2026-003",
    productName: "Moniteur patient",
    date: "2026-04-22",
    amount: 700,
    status: "Expédiée",
  },
];

export default function AccountOrdersPage() {
  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Mes commandes</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Historique de vos commandes (mock).</p>

      {ordersMock.length === 0 ? (
        <article style={cardStyle}>
          <p style={{ margin: 0 }}>Vous n’avez pas encore de commande.</p>
        </article>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          {ordersMock.map((order) => (
            <article key={order.id} style={cardStyle}>
              <p style={{ margin: 0, fontWeight: 700 }}>{order.productName}</p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#555" }}>Date : {order.date}</p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#111" }}>Montant : {order.amount} €</p>
              <p style={{ margin: "0.35rem 0 0 0", color: "#003d5c", fontWeight: 600 }}>
                Statut : {order.status}
              </p>
            </article>
          ))}
        </div>
      )}

      <Link
        href="/account"
        style={{ display: "inline-block", marginTop: "1rem", color: "#003d5c", textDecoration: "none" }}
      >
        Retour au compte
      </Link>
    </section>
  );
}
