"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./HeaderSearchBar.module.css";

export default function HeaderSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  function submitSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    setMobileOpen(false);
  }

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={submitSearch} className={styles.desktopForm} role="search" aria-label="Recherche produit">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un produit..."
          className={styles.input}
          aria-label="Rechercher un produit"
        />
        <button type="submit" className={styles.submitButton} aria-label="Lancer la recherche">
          Rechercher
        </button>
      </form>

      <div className={styles.mobileSearch}>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className={styles.iconButton}
          aria-label={mobileOpen ? "Fermer la recherche" : "Ouvrir la recherche"}
        >
          🔍
        </button>

        {mobileOpen ? (
          <form onSubmit={submitSearch} className={styles.mobileForm} role="search" aria-label="Recherche produit mobile">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un produit..."
              className={styles.input}
              aria-label="Rechercher un produit"
            />
            <button type="submit" className={styles.submitButton} aria-label="Lancer la recherche">
              OK
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
