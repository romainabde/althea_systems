"use client";

import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { paymentsApi } from "../_services/adminApi";

// PaymentDto : { id, orderId, providerPaymentId, amount, currency, status,
//                createdAt, updatedAt, refundedAt }

const STATUS_LABEL = {
  CAPTURED: "Capturé",
  PENDING: "En attente",
  FAILED: "Échec",
  REFUNDED: "Remboursé",
};

export default function PaymentsPanel() {
  const { rows, loading, error, refresh, run } = useResource(
    paymentsApi.list
  );

  function handleRefund(id) {
    return run(() => paymentsApi.refund(id));
  }

  const columns = [
    { key: "id", label: "ID", width: "80px" },
    { key: "orderId", label: "Commande", width: "100px" },
    { key: "providerPaymentId", label: "Provider ID" },
    {
      key: "amount",
      label: "Montant",
      width: "130px",
      accessor: (row) => Number(row.amount ?? 0),
      render: (row) =>
        `${formatMoney(row.amount)} ${row.currency ?? "EUR"}`,
    },
    {
      key: "status",
      label: "Statut",
      width: "120px",
      render: (row) => {
        const variant =
          row.status === "CAPTURED"
            ? styles.badgeSuccess
            : row.status === "PENDING"
            ? styles.badgeWarning
            : row.status === "FAILED"
            ? styles.badgeDanger
            : styles.badgeInfo;
        return (
          <span className={`${styles.badge} ${variant}`}>
            {STATUS_LABEL[row.status] ?? row.status ?? "—"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      width: "150px",
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <ResourcePanel
      title="Paiements"
      subtitle="Suivi des transactions et remboursements."
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={refresh}
      searchPlaceholder="Rechercher (provider, statut)…"
      searchFields={["providerPaymentId", "status"]}
      canCreate={false}
      canDelete={false}
      canBulkDelete={false}
      renderDetail={PaymentDetail}
      extraActions={(row) => (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
          onClick={() => handleRefund(row.id)}
          disabled={row.status === "REFUNDED"}
        >
          Rembourser
        </button>
      )}
    />
  );
}

function PaymentDetail(payment) {
  return (
    <div className={styles.detailGrid}>
      <Detail label="ID" value={payment.id} />
      <Detail label="Commande" value={payment.orderId} />
      <Detail label="Provider ID" value={payment.providerPaymentId} />
      <Detail
        label="Montant"
        value={`${formatMoney(payment.amount)} ${payment.currency ?? ""}`}
      />
      <Detail
        label="Statut"
        value={STATUS_LABEL[payment.status] ?? payment.status}
      />
      <Detail label="Créé le" value={formatDate(payment.createdAt)} />
      <Detail label="Modifié le" value={formatDate(payment.updatedAt)} />
      <Detail label="Remboursé le" value={formatDate(payment.refundedAt)} />
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
    return new Date(iso).toLocaleString("fr-FR", {
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
