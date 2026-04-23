import Link from "next/link";

const pageStyle = {
  padding: "1rem",
  maxWidth: "640px",
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

export default function AccountDashboardPage() {
  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Mon compte</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Consultez vos commandes et mettez à jour vos informations.
      </p>

      <article style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Mes commandes</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#555" }}>
          Suivez vos commandes et leur statut.
        </p>
        <Link href="/account/orders" style={linkStyle}>
          Voir mes commandes
        </Link>
      </article>

      <article style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Paramètres</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#555" }}>
          Modifiez votre email ou votre mot de passe.
        </p>
        <Link href="/account/settings" style={linkStyle}>
          Ouvrir les paramètres
        </Link>
      </article>
    </section>
  );
}
