"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { ordersApi } from "../_services/adminApi";

// Statuts acceptés par OrderService.ALLOWED_STATUSES (admin-service).
// On expose les statuts modernes en priorité (alignés avec Prisma `status`
// qui défaut à PENDING).
const STATUSES = [
  { value: "PENDING", label: "En attente" },
  { value: "PROCESSING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
  { value: "REFUNDED", label: "Remboursée" },
];

const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));

export default function OrdersPanel() {
  const { rows, loading, error, refresh, run } = useResource(() =>
    ordersApi.list()
  );

  function handleUpdate(id, values) {
    return run(() => ordersApi.updateStatus(id, { status: values.status }));
  }

  function handleRefund(id) {
    return run(() => ordersApi.refund(id));
  }

  const columns = [
    { key: "id", label: "ID", width: "80px" },
    {
      key: "userEmail",
      label: "Client",
      accessor: (row) => row.userEmail ?? `User #${row.userId ?? "?"}`,
    },
    {
      key: "createdAt",
      label: "Date",
      width: "170px",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "totalAmount",
      label: "Montant",
      width: "120px",
      accessor: (row) => Number(row.totalAmount ?? 0),
      render: (row) => `${formatMoney(row.totalAmount)} €`,
    },
    {
      key: "itemCount",
      label: "Articles",
      width: "100px",
      accessor: (row) => row.itemCount ?? 0,
    },
    {
      key: "status",
      label: "Statut",
      width: "140px",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <ResourcePanel
      title="Commandes"
      subtitle="Suivi et mise à jour du statut des commandes clients."
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={refresh}
      searchPlaceholder="Rechercher (email, statut)…"
      searchFields={["userEmail", "status"]}
      canCreate={false}
      canDelete={false}
      canBulkDelete={false}
      onUpdate={handleUpdate}
      renderForm={OrderForm}
      renderDetail={(row) => <OrderDetail row={row} />}
      extraActions={(row) => (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
          onClick={() => handleRefund(row.id)}
          disabled={row.status === "REFUNDED"}
          title="Lancer un remboursement"
        >
          Rembourser
        </button>
      )}
    />
  );
}

function StatusBadge({ status }) {
  const variant =
    status === "DELIVERED" || status === "COMPLETED" || status === "TERMINEE"
      ? styles.badgeSuccess
      : status === "CANCELLED" ||
        status === "CANCELED" ||
        status === "ANNULEE" ||
        status === "REFUNDED"
      ? styles.badgeDanger
      : status === "SHIPPED"
      ? styles.badgeInfo
      : styles.badgeWarning;
  return (
    <span className={`${styles.badge} ${variant}`}>
      {STATUS_LABEL[status] ?? status ?? "—"}
    </span>
  );
}

function OrderForm({ initialValues, onSubmit, onCancel }) {
  const [status, setStatus] = useState(initialValues.status ?? "PENDING");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ status });
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className={styles.helperText}>
        Commande <strong>#{initialValues.id}</strong> – Client :{" "}
        <strong>
          {initialValues.userEmail ?? `User #${initialValues.userId ?? "?"}`}
        </strong>
      </p>
      <div className={styles.formGroup} style={{ marginTop: "0.5rem" }}>
        <label className={styles.label}>Statut de la commande</label>
        <select
          className={styles.select}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={onCancel}
        >
          Annuler
        </button>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}

function OrderDetail({ row }) {
  // row = OrderSummaryDto (ce qu'on a dans la liste). On peut afficher direct.
  return (
    <div className={styles.detailGrid}>
      <Detail label="ID" value={row.id} />
      <Detail
        label="Client"
        value={row.userEmail ?? `User #${row.userId ?? "?"}`}
      />
      <Detail label="Date" value={formatDate(row.createdAt)} />
      <Detail
        label="Montant"
        value={`${formatMoney(row.totalAmount)} €`}
      />
      <Detail label="Articles" value={row.itemCount} />
      <Detail
        label="Statut"
        value={STATUS_LABEL[row.status] ?? row.status}
      />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>
        {value == null || value === "" ? "—" : String(value)}
      </span>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

function formatMoney(n) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n ?? 0));
}
