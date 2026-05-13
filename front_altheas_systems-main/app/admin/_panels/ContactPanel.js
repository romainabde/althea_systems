"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { contactApi } from "../_services/adminApi";

// ContactMessageDto : { id, fullName, email, subject, message, status,
//   createdAt, responseMessage, respondedBy, respondedAt }
// Statut : NEW | RESPONDED

const STATUS_LABEL = {
  NEW: "Nouveau",
  RESPONDED: "Répondu",
};

export default function ContactPanel() {
  const { rows, loading, error, refresh, run } = useResource(
    contactApi.list
  );

  function handleUpdate(id, values) {
    return run(() =>
      contactApi.respond(id, {
        responseMessage: values.responseMessage,
        respondedBy: values.respondedBy || "admin",
      })
    );
  }

  const columns = [
    { key: "id", label: "ID", width: "70px" },
    { key: "fullName", label: "Expéditeur" },
    { key: "email", label: "Email" },
    { key: "subject", label: "Sujet" },
    {
      key: "createdAt",
      label: "Date",
      width: "150px",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (row) => {
        const variant =
          row.status === "RESPONDED"
            ? styles.badgeSuccess
            : styles.badgeWarning;
        return (
          <span className={`${styles.badge} ${variant}`}>
            {STATUS_LABEL[row.status] ?? row.status}
          </span>
        );
      },
    },
  ];

  return (
    <ResourcePanel
      title="Messages de contact"
      subtitle="Lecture et réponse aux messages reçus via le formulaire."
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={refresh}
      searchPlaceholder="Rechercher (sujet, expéditeur)…"
      searchFields={["fullName", "email", "subject"]}
      canCreate={false}
      canDelete={false}
      canBulkDelete={false}
      onUpdate={handleUpdate}
      renderForm={MessageForm}
      renderDetail={MessageDetail}
    />
  );
}

function MessageForm({ initialValues, onSubmit, onCancel }) {
  const [responseMessage, setResponseMessage] = useState(
    initialValues.responseMessage ?? ""
  );
  const [respondedBy, setRespondedBy] = useState(
    initialValues.respondedBy ?? "admin"
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!responseMessage.trim()) return;
    onSubmit({ responseMessage, respondedBy });
  }

  const alreadyResponded = initialValues.status === "RESPONDED";

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.detailGrid}>
        <Detail
          label="De"
          value={`${initialValues.fullName} <${initialValues.email}>`}
        />
        <Detail label="Sujet" value={initialValues.subject} />
      </div>
      <div className={styles.detailItem} style={{ marginTop: "0.85rem" }}>
        <span className={styles.detailLabel}>Message reçu</span>
        <span className={styles.detailValue}>{initialValues.message}</span>
      </div>

      {alreadyResponded && (
        <p className={styles.helperText} style={{ marginTop: "0.85rem" }}>
          ⚠ Ce message a déjà reçu une réponse. L'API rejettera une nouvelle
          tentative.
        </p>
      )}

      <div className={styles.formGrid} style={{ marginTop: "1rem" }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Agent répondant *</label>
          <input
            className={styles.input}
            value={respondedBy}
            onChange={(e) => setRespondedBy(e.target.value)}
            required
          />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Votre réponse *</label>
        <textarea
          className={styles.textarea}
          value={responseMessage}
          onChange={(e) => setResponseMessage(e.target.value)}
          required
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={onCancel}
        >
          Annuler
        </button>
        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={alreadyResponded}
        >
          Envoyer la réponse
        </button>
      </div>
    </form>
  );
}

function MessageDetail(msg) {
  return (
    <div className={styles.detailGrid}>
      <Detail label="ID" value={msg.id} />
      <Detail label="De" value={`${msg.fullName} <${msg.email}>`} />
      <Detail label="Sujet" value={msg.subject} />
      <Detail label="Date" value={formatDate(msg.createdAt)} />
      <Detail label="Statut" value={STATUS_LABEL[msg.status] ?? msg.status} />
      <Detail label="Répondu par" value={msg.respondedBy} />
      <Detail label="Répondu le" value={formatDate(msg.respondedAt)} />
      <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
        <span className={styles.detailLabel}>Message</span>
        <span className={styles.detailValue}>{msg.message}</span>
      </div>
      <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
        <span className={styles.detailLabel}>Réponse envoyée</span>
        <span className={styles.detailValue}>
          {msg.responseMessage || "—"}
        </span>
      </div>
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
