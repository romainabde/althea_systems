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

const linkStyle = {
  display: "inline-block",
  marginTop: "0.7rem",
  color: "#003d5c",
  textDecoration: "none",
  fontWeight: 600,
};

export default function AdminDashboardPage() {
  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Dashboard Admin</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Gérez rapidement les produits, commandes et utilisateurs.
      </p>

      <article style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Produits</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#555" }}>
          Ajouter, modifier ou supprimer des produits.
        </p>
        <Link href="/admin/products" style={linkStyle}>
          Ouvrir la gestion produits
        </Link>
      </article>

      <article style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Commandes</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#555" }}>
          Suivre les commandes et mettre à jour leur statut.
        </p>
        <Link href="/admin/orders" style={linkStyle}>
          Ouvrir la gestion commandes
        </Link>
      </article>

      <article style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Utilisateurs</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#555" }}>
          Consulter et administrer les comptes utilisateurs.
        </p>
        <Link href="/admin/users" style={linkStyle}>
          Ouvrir la gestion utilisateurs
        </Link>
      </article>
    </section>
  );
}
