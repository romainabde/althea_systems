"use client";

import styles from "../admin.module.css";
import { MENU_GROUPS, MENU_ITEMS } from "../_panels/menuConfig";

export default function Sidebar({ activeId, onSelect }) {
  return (
    <aside className={styles.sidebar} aria-label="Navigation backoffice">
      <div className={styles.sidebarHeader}>
        <p className={styles.sidebarTitle}>Backoffice</p>
        <p className={styles.sidebarSubtitle}>Althea Systems</p>
      </div>

      {MENU_GROUPS.map((group) => {
        const items = MENU_ITEMS.filter((item) => item.group === group.id);
        if (items.length === 0) return null;

        return (
          <div key={group.id}>
            <p className={styles.sidebarSection}>{group.label}</p>
            {items.map((item) => {
              const isActive = item.id === activeId;
              const className = isActive
                ? `${styles.sidebarItem} ${styles.sidebarItemActive}`
                : styles.sidebarItem;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={className}
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.sidebarIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
