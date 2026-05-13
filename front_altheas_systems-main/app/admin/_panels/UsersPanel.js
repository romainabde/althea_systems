"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { usersApi } from "../_services/adminApi";

// UserDto : { id, fullName, email, role, status, locked,
//             isEmailConfirmed, createdAt }
// L'admin-service ne gère que UPDATE et DELETE (pas de création).

const ROLES = [
  { value: "CUSTOMER", label: "Client" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPPORT", label: "Support" },
];
const STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "INACTIVE", label: "Inactif" },
  { value: "SUSPENDED", label: "Suspendu" },
];
const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));
const STATUS_LABEL = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label])
);

export default function UsersPanel() {
  const { rows, loading, error, refresh, run } = useResource(usersApi.list);

  function handleUpdate(id, values) {
    return run(() => usersApi.update(id, toPayload(values)));
  }
  function handleDelete(id) {
    return run(() => usersApi.remove(id));
  }
  function handleDeleteMany(ids) {
    return run(() => usersApi.removeMany(ids));
  }

  const columns = [
    { key: "id", label: "ID", width: "70px" },
    { key: "fullName", label: "Nom complet" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Rôle",
      width: "110px",
      render: (row) => (
        <span className={`${styles.badge} ${styles.badgeInfo}`}>
          {ROLE_LABEL[row.role] ?? row.role}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (row) => {
        const variant =
          row.status === "ACTIVE"
            ? styles.badgeSuccess
            : row.status === "SUSPENDED"
            ? styles.badgeDanger
            : styles.badgeWarning;
        return (
          <span className={`${styles.badge} ${variant}`}>
            {STATUS_LABEL[row.status] ?? row.status}
          </span>
        );
      },
    },
    {
      key: "locked",
      label: "Verrouillé",
      width: "100px",
      accessor: (row) => (row.locked ? 1 : 0),
      render: (row) =>
        row.locked ? (
          <span className={`${styles.badge} ${styles.badgeDanger}`}>Oui</span>
        ) : (
          "Non"
        ),
    },
    {
      key: "isEmailConfirmed",
      label: "Email confirmé",
      width: "120px",
      accessor: (row) => (row.isEmailConfirmed ? 1 : 0),
      render: (row) => (row.isEmailConfirmed ? "Oui" : "Non"),
    },
    {
      key: "createdAt",
      label: "Inscrit le",
      width: "150px",
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <ResourcePanel
      title="Utilisateurs"
      subtitle="Modifier et supprimer les comptes (création gérée par auth-cart-service)."
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={refresh}
      searchPlaceholder="Rechercher (nom, email, rôle)…"
      searchFields={["fullName", "email", "role"]}
      canCreate={false}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onDeleteMany={handleDeleteMany}
      renderForm={UserForm}
      renderDetail={UserDetail}
    />
  );
}

function toPayload(values) {
  return {
    fullName: values.fullName?.trim() || null,
    email: values.email?.trim() || null,
    role: values.role || null,
    status: values.status || null,
    locked:
      values.locked === undefined || values.locked === null
        ? null
        : Boolean(values.locked),
    isEmailConfirmed:
      values.isEmailConfirmed === undefined ||
      values.isEmailConfirmed === null
        ? null
        : Boolean(values.isEmailConfirmed),
  };
}

function UserForm({ initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    fullName: initialValues.fullName ?? "",
    email: initialValues.email ?? "",
    role: initialValues.role ?? "CUSTOMER",
    status: initialValues.status ?? "ACTIVE",
    locked: initialValues.locked ?? false,
    isEmailConfirmed: initialValues.isEmailConfirmed ?? false,
  });

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!values.email.trim()) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nom complet</label>
          <input
            className={styles.input}
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email *</label>
          <input
            type="email"
            className={styles.input}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Rôle</label>
          <select
            className={styles.select}
            value={values.role}
            onChange={(e) => update("role", e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Statut</label>
          <select
            className={styles.select}
            value={values.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Verrouillé</label>
          <select
            className={styles.select}
            value={values.locked ? "true" : "false"}
            onChange={(e) => update("locked", e.target.value === "true")}
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email confirmé</label>
          <select
            className={styles.select}
            value={values.isEmailConfirmed ? "true" : "false"}
            onChange={(e) =>
              update("isEmailConfirmed", e.target.value === "true")
            }
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </div>
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

function UserDetail(user) {
  return (
    <div className={styles.detailGrid}>
      <Detail label="ID" value={user.id} />
      <Detail label="Nom complet" value={user.fullName} />
      <Detail label="Email" value={user.email} />
      <Detail label="Rôle" value={ROLE_LABEL[user.role] ?? user.role} />
      <Detail
        label="Statut"
        value={STATUS_LABEL[user.status] ?? user.status}
      />
      <Detail label="Verrouillé" value={user.locked ? "Oui" : "Non"} />
      <Detail
        label="Email confirmé"
        value={user.isEmailConfirmed ? "Oui" : "Non"}
      />
      <Detail label="Inscrit le" value={formatDate(user.createdAt)} />
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
