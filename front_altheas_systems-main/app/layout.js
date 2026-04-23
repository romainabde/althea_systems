import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <header style={{ padding: "1rem", background: "#003d5c", color: "white" }}>
          <h2 style={{ margin: 0 }}>Althea Systems</h2>
          <nav style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.75rem 1rem" }}>
            <Link href="/" style={{ color: "white", textDecoration: "none" }}>
              Accueil
            </Link>
            <Link href="/products" style={{ color: "white", textDecoration: "none" }}>
              Catalogue
            </Link>
            <Link href="/search" style={{ color: "white", textDecoration: "none" }}>
              Recherche
            </Link>
            <Link href="/cart" style={{ color: "white", textDecoration: "none" }}>
              Panier
            </Link>
            <Link href="/account" style={{ color: "white", textDecoration: "none" }}>
              Compte
            </Link>
          </nav>
        </header>

        <main style={{ minHeight: "calc(100vh - 170px)" }}>{children}</main>

        <footer style={{ padding: "1rem", background: "#003d5c", color: "white" }}>
          <p>© 2026 Althea Systems</p>
        </footer>
      </body>
    </html>
  );
}