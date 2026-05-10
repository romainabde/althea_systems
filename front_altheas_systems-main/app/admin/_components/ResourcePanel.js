"use client";

import { useMemo, useState } from "react";
import styles from "../admin.module.css";
import DataTable from "./DataTable";
import ConfirmDialog from "./ConfirmDialog";

// =============================================================================
// ResourcePanel
// -----------------------------------------------------------------------------
// Composant générique implémentant le pattern "liste / détail / créer / éditer
// / supprimer" demandé par le cahier des charges.
//
// L'écran a 4 modes internes (state.view) :
//   - "list"   : tableau triable + sélection multiple + actions groupées
//   - "detail" : page lecture seule
//   - "create" : formulaire de création
//   - "edit"   : formulaire d'édition (préformulaire pré-rempli)
//
// Props :
//   - title          : titre affiché en haut du panneau
//   - subtitle       : sous-titre optionnel
//   - rows           : données affichées dans le tableau
//   - columns        : colonnes pour DataTable
//   - rowKey         : (row) => id (défaut row.id)
//   - searchPlaceholder, searchFields : pour la barre de recherche locale
//   - renderForm     : ({ initialValues, onSubmit, onCancel, mode }) => JSX
//                      "mode" vaut "create" ou "edit"
//   - renderDetail   : (row) => JSX
//   - emptyValues    : valeurs initiales pour le formulaire de création
//   - onCreate, onUpdate, onDelete, onDeleteMany : callbacks (peuvent appeler
//                      le adminApi).
//   - canCreate (default true)
//   - extraActions   : (row) => JSX  pour ajouter des boutons supplémentaires
//                      sur chaque ligne (ex: refund pour les commandes)
// =============================================================================

export default function ResourcePanel({
  title,
  subtitle,
  rows,
  columns,
  rowKey = (row) => row.id,
  searchPlaceholder,
  searchFields,
  renderForm,
  renderDetail,
  emptyValues,
  onCreate,
  onUpdate,
  onDelete,
  onDeleteMany,
  canCreate = true,
  canDelete = true,
  canBulkDelete = true,
  extraActions,
  loading = false,
  error = null,
  onRefresh,
}) {
  const [view, setView] = useState("list");
  const [activeRow, setActiveRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);

  const filteredRows = useMemo(() => {
    if (!search.trim() || !searchFields || searchFields.length === 0) {
      return rows;
    }
    const needle = search.trim().toLowerCase();
    return rows.filter((row) =>
      searchFields.some((field) => {
        const value = row[field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(needle);
      })
    );
  }, [rows, search, searchFields]);

  function goToList() {
    setView("list");
    setActiveRow(null);
  }

  function handleDetail(row) {
    setActiveRow(row);
    setView("detail");
  }

  function handleEdit(row) {
    setActiveRow(row);
    setView("edit");
  }

  function handleCreate() {
    setActiveRow(null);
    setView("create");
  }

  function handleDeleteSingle() {
    if (confirmDeleteId == null) return;
    if (typeof onDelete === "function") onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
    setSelectedIds((prev) => prev.filter((id) => id !== confirmDeleteId));
    if (view !== "list") goToList();
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (typeof onDeleteMany === "function") onDeleteMany(selectedIds);
    setSelectedIds([]);
    setConfirmBulkOpen(false);
  }

  // ----- Colonnes étendues avec actions par ligne ---------------------------
  const columnsWithActions = useMemo(() => {
    const actionsColumn = {
      key: "__actions",
      label: "Actions",
      sortable: false,
      width: "200px",
      render: (row) => (
        <div
          className={styles.btnRow}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
            onClick={() => handleDetail(row)}
          >
            Détails
          </button>
          {typeof renderForm === "function" && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSm} ${styles.btnAccent}`}
              onClick={() => handleEdit(row)}
            >
              Modifier
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
              onClick={() => setConfirmDeleteId(rowKey(row))}
            >
              Supprimer
            </button>
          )}
          {typeof extraActions === "function" ? extraActions(row) : null}
        </div>
      ),
    };
    return [...columns, actionsColumn];
  }, [columns, extraActions, rowKey, renderForm, canDelete]);

  // ----- Rendu --------------------------------------------------------------
  return (
    <div>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>{title}</h1>
          {subtitle && <p className={styles.contentSubtitle}>{subtitle}</p>}
        </div>
        <div className={styles.btnRow}>
          {view === "list" && typeof onRefresh === "function" && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? "…" : "↻ Rafraîchir"}
            </button>
          )}
          {view === "list" && canCreate && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleCreate}
            >
              + Nouveau
            </button>
          )}
          {view !== "list" && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={goToList}
            >
              ← Retour à la liste
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className={styles.bulkBar}
          style={{
            background: "#fee2e2",
            borderColor: "#dc2626",
            color: "#991b1b",
          }}
        >
          <span>⚠ {String(error.message ?? error)}</span>
        </div>
      )}

      {view === "list" && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              {searchFields && searchFields.length > 0 && (
                <input
                  type="search"
                  placeholder={
                    searchPlaceholder ?? "Rechercher dans la liste…"
                  }
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}
            </div>
            <div className={styles.toolbarRight}>
              <span className={styles.helperText}>
                {filteredRows.length} élément
                {filteredRows.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className={styles.bulkBar}>
              <span>
                {selectedIds.length} élément
                {selectedIds.length > 1 ? "s" : ""} sélectionné
                {selectedIds.length > 1 ? "s" : ""}
              </span>
              <div className={styles.btnRow}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
                  onClick={() => setSelectedIds([])}
                >
                  Tout désélectionner
                </button>
                {canBulkDelete && (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                    onClick={() => setConfirmBulkOpen(true)}
                  >
                    Supprimer la sélection
                  </button>
                )}
              </div>
            </div>
          )}

          <DataTable
            columns={columnsWithActions}
            rows={filteredRows}
            selectable={canBulkDelete}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            rowKey={rowKey}
            emptyMessage={
              loading ? "Chargement…" : "Aucun élément à afficher."
            }
          />
        </>
      )}

      {view === "detail" && activeRow && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Détails</h2>
            <div className={styles.btnRow}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnAccent}`}
                onClick={() => handleEdit(activeRow)}
              >
                Modifier
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => setConfirmDeleteId(rowKey(activeRow))}
              >
                Supprimer
              </button>
            </div>
          </div>
          {typeof renderDetail === "function" ? (
            renderDetail(activeRow)
          ) : (
            <DefaultDetail row={activeRow} columns={columns} />
          )}
        </div>
      )}

      {view === "create" && typeof renderForm === "function" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Nouveau</h2>
          </div>
          {renderForm({
            mode: "create",
            initialValues: emptyValues ?? {},
            onSubmit: (values) => {
              if (typeof onCreate === "function") onCreate(values);
              goToList();
            },
            onCancel: goToList,
          })}
        </div>
      )}

      {view === "edit" && activeRow && typeof renderForm === "function" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Modifier</h2>
          </div>
          {renderForm({
            mode: "edit",
            initialValues: activeRow,
            onSubmit: (values) => {
              if (typeof onUpdate === "function")
                onUpdate(rowKey(activeRow), values);
              goToList();
            },
            onCancel: goToList,
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId != null}
        title="Supprimer cet élément ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDeleteSingle}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmBulkOpen}
        title="Supprimer la sélection ?"
        message={`Vous êtes sur le point de supprimer ${selectedIds.length} élément${selectedIds.length > 1 ? "s" : ""}. Cette action est irréversible.`}
        confirmLabel="Tout supprimer"
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkOpen(false)}
      />
    </div>
  );
}

function DefaultDetail({ row, columns }) {
  return (
    <div className={styles.detailGrid}>
      {columns.map((column) => {
        const accessor =
          column.accessor ?? ((r) => (r ? r[column.key] : ""));
        const value = accessor(row);
        return (
          <div key={column.key} className={styles.detailItem}>
            <span className={styles.detailLabel}>{column.label}</span>
            <span className={styles.detailValue}>
              {value == null || value === "" ? "—" : String(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
