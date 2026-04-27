import Link from "next/link";
import Image from "next/image";
import DesktopFooter from "../components/layout/DesktopFooter";
import ChatWidget from "../components/chat/ChatWidget";
import HeaderSearchBar from "../components/layout/HeaderSearchBar";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <header style={{ padding: "1rem", background: "#003d5c", color: "white" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/images/logo.png"
              alt="Althea Systems"
              width={160}
              height={40}
              priority
              style={{ width: "auto", height: "clamp(30px, 5vw, 40px)" }}
            />
          </Link>
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
          <HeaderSearchBar />
        </header>

        <main style={{ minHeight: "calc(100vh - 170px)" }}>{children}</main>

        <DesktopFooter />
        <ChatWidget />
      </body>
    </html>
  );
}