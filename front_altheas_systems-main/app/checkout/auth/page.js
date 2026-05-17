import Link from "next/link";

const choiceCardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  display: "grid",
  gap: "0.75rem",
  background: "#fff",
};

const actionButtonStyle = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "0.7rem 1rem",
  border: "none",
  borderRadius: "8px",
  background: "#003d5c",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};

export default function CheckoutAuthPage() {
  return (
    <section style={{ padding: "1rem", maxWidth: "540px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Finaliser la commande</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Choisissez comment continuer votre checkout.
      </p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
        <article style={choiceCardStyle}>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Connexion</h2>
          <p style={{ margin: 0, color: "#555" }}>
            J’ai déjà un compte.
          </p>
          <Link href="/login?next=%2Fcheckout%2Faddress" style={actionButtonStyle}>
            Se connecter
          </Link>
        </article>

        <article style={choiceCardStyle}>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Inscription</h2>
          <p style={{ margin: 0, color: "#555" }}>
            Je crée un compte pour continuer.
          </p>
          <Link href="/register?next=%2Fcheckout%2Faddress" style={actionButtonStyle}>
            Créer un compte
          </Link>
        </article>

        <article style={choiceCardStyle}>
          <h2 style={{ margin: 0, fontSize: "1rem" }}>Continuer en invité</h2>
          <p style={{ margin: 0, color: "#555" }}>
            Je continue sans créer de compte.
          </p>
          <Link href="/checkout/address" style={actionButtonStyle}>
            Continuer en invité
          </Link>
        </article>
      </div>
    </section>
  );
}
