// =============================================================================
// menuConfig.js
// -----------------------------------------------------------------------------
// SOURCE UNIQUE de configuration du menu de gauche du backoffice.
//
// Pour ajouter un nouvel onglet plus tard :
//   1. Importer le composant du panneau (ex: import MyPanel from "./MyPanel")
//   2. Ajouter une entrée dans MENU_ITEMS avec un id unique et group "resources"
//      ou "analytics" (ou un nouveau groupe).
//   3. C'est tout. Le shell rend automatiquement le bon composant.
//
// Chaque entrée :
//   { id, label, icon, group, component }
// =============================================================================

import DashboardPanel from "./DashboardPanel";
import HomeCmsPanel from "./HomeCmsPanel";
import CategoriesPanel from "./CategoriesPanel";
import ProductsPanel from "./ProductsPanel";
import OrdersPanel from "./OrdersPanel";
import UsersPanel from "./UsersPanel";
import ContactPanel from "./ContactPanel";
import PaymentsPanel from "./PaymentsPanel";

export const MENU_GROUPS = [
  { id: "analytics", label: "Suivi" },
  { id: "resources", label: "Gestion des ressources" },
];

export const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: "📊",
    group: "analytics",
    component: DashboardPanel,
  },
  {
    id: "home-cms",
    label: "Page d'accueil (CMS)",
    icon: "🏠",
    group: "resources",
    component: HomeCmsPanel,
  },
  {
    id: "categories",
    label: "Catégories",
    icon: "🗂️",
    group: "resources",
    component: CategoriesPanel,
  },
  {
    id: "products",
    label: "Produits",
    icon: "📦",
    group: "resources",
    component: ProductsPanel,
  },
  {
    id: "orders",
    label: "Commandes",
    icon: "🧾",
    group: "resources",
    component: OrdersPanel,
  },
  {
    id: "users",
    label: "Utilisateurs",
    icon: "👥",
    group: "resources",
    component: UsersPanel,
  },
  {
    id: "contact",
    label: "Messages",
    icon: "✉️",
    group: "resources",
    component: ContactPanel,
  },
  {
    id: "payments",
    label: "Paiements",
    icon: "💳",
    group: "resources",
    component: PaymentsPanel,
  },
];

export const DEFAULT_PANEL_ID = "dashboard";

export function getPanelById(id) {
  return MENU_ITEMS.find((item) => item.id === id) ?? null;
}
