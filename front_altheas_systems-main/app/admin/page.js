"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import Sidebar from "./_components/Sidebar";
import {
  DEFAULT_PANEL_ID,
  MENU_ITEMS,
  getPanelById,
} from "./_panels/menuConfig";

// =============================================================================
// AdminDashboardPage
// -----------------------------------------------------------------------------
// Shell du backoffice. Composé de :
//   - une barre latérale (Sidebar) à gauche
//   - une zone de contenu à droite, qui affiche dynamiquement le composant
//     "panel" associé à l'onglet actif (comportement pseudo-iframe : on change
//     uniquement le composant rendu, pas d'iframe DOM, pas de navigation).
//
// Pour ajouter un nouvel onglet : voir _panels/menuConfig.js — c'est le seul
// fichier à modifier.
// =============================================================================

export default function AdminDashboardPage() {
  const [activeId, setActiveId] = useState(DEFAULT_PANEL_ID);
  const active = getPanelById(activeId) ?? MENU_ITEMS[0];
  const PanelComponent = active.component;

  return (
    <div className={styles.shell}>
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      <main className={styles.content}>
        <PanelComponent />
      </main>
    </div>
  );
}
