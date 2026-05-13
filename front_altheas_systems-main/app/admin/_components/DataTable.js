"use client";

import { useMemo, useState } from "react";
import styles from "../admin.module.css";

// =============================================================================
// DataTable
// -----------------------------------------------------------------------------
// Composant de tableau réutilisable pour le backoffice.
//
// Props :
//   - columns  : [
//       {
//         key: "name",            // identifiant unique
//         label: "Nom",           // libellé affiché
//         sortable: true,         // optionnel (défaut true)
//         accessor: (row) => ...  // optionnel : valeur utilisée pour le tri
//                                 //   et comme contenu par défaut
//         render: (row) => ...    // optionnel : rendu personnalisé de la cellule
//         width: "120px",         // optionnel
//       }, ...
//     ]
//   - rows           : tableau de données (chaque ligne doit avoir un id)
//   - selectable     : bool — affiche les checkboxes de sélection multiple
//   - selectedIds    : tableau d'ids sélectionnés
//   - onSelectionChange : (ids) => void
//   - rowKey         : (row) => string|number  (défaut: row.id)
//   - onRowClick     : (row) => void
//   - emptyMessage   : string
// =============================================================================

export default function DataTable({
  columns,
  rows,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  rowKey = (row) => row.id,
  onRowClick,
  emptyMessage = "Aucun élément à afficher.",
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const column = columns.find((c) => c.key === sortKey);
    if (!column) return rows;

    const accessor =
      column.accessor ?? ((row) => (row ? row[column.key] : undefined));

    const copy = [...rows];
    copy.sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);

      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      if (typeof va === "number" && typeof vb === "number") {
        return va - vb;
      }
      return String(va).localeCompare(String(vb), "fr", {
        numeric: true,
        sensitivity: "base",
      });
    });
    if (sortDir === "desc") copy.reverse();
    return copy;
  }, [rows, columns, sortKey, sortDir]);

  function handleSort(column) {
    if (column.sortable === false) return;
    if (sortKey === column.key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDir("asc");
    }
  }

  function isAllSelected() {
    if (sortedRows.length === 0) return false;
    return sortedRows.every((row) => selectedIds.includes(rowKey(row)));
  }

  function isSomeSelected() {
    return (
      selectedIds.length > 0 &&
      selectedIds.length < sortedRows.length &&
      sortedRows.some((row) => selectedIds.includes(rowKey(row)))
    );
  }

  function toggleAll() {
    if (!onSelectionChange) return;
    if (isAllSelected()) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sortedRows.map((row) => rowKey(row)));
    }
  }

  function toggleOne(id) {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {selectable && (
              <th className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  aria-label="Tout sélectionner"
                  checked={isAllSelected()}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected();
                  }}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((column) => {
              const sortable = column.sortable !== false;
              const isActive = sortKey === column.key;
              return (
                <th
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  className={sortable ? styles.thSortable : undefined}
                  onClick={sortable ? () => handleSort(column) : undefined}
                  aria-sort={
                    isActive
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {column.label}
                  {sortable && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {isActive ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={styles.tableEmpty}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => {
              const id = rowKey(row);
              const isSelected = selectedIds.includes(id);
              return (
                <tr
                  key={id}
                  className={isSelected ? styles.tableRowSelected : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {selectable && (
                    <td
                      className={styles.checkboxCell}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Sélectionner ${id}`}
                        checked={isSelected}
                        onChange={() => toggleOne(id)}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const accessor =
                      column.accessor ?? ((r) => (r ? r[column.key] : ""));
                    const renderer = column.render ?? accessor;
                    return <td key={column.key}>{renderer(row)}</td>;
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
