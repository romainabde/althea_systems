"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { categoriesApi } from "../_services/adminApi";

// Aligné avec com.althea.shared.model.Category :
//   { id, name, description, imageUrl, displayOrder, active,
//     createdAt, updatedAt }
// (le champ "products" est ignoré côté JSON via @JsonIgnore)

export default function CategoriesPanel() {
  const { rows, loading, error, refresh, run } = useResource(
    categoriesApi.list
  );

  function handleCreate(values) {
    return run(() => categoriesApi.create(toPayload(values)));
  }
  function handleUpdate(id, values) {
    return run(() => categoriesApi.update(id, toPayload(values)));
  }
  function handleDelete(id) {
    return run(() => categoriesApi.remove(id));
  }
  function handleDeleteMany(ids) {
    return run(() => categoriesApi.removeMany(ids));
  }

  const columns = [
    { key: "id", label: "ID", width: "80px" },
    { key: "name", label: "Nom" },
    {
      key: "displayOrder",
      label: "Ordre",
      width: "90px",
      accessor: (row) => row.displayOrder ?? 0,
    },
    {
      key: "active",
      label: "Actif",
      width: "90px",
      accessor: (row) => (row.active ? 1 : 0),
      render: (row) => (
        <span
          className={`${styles.badge} ${
            row.active ? styles.badgeSuccess : styles.badgeDanger
          }`}
        >
          {row.active ? "Oui" : "Non"}
        </span>
      ),
    },
    { key: "imageUrl", label: "Image" },
  ];

  return (
    <ResourcePanel
      title="Catégories"
      subtitle="Organisation du catalogue par catégorie."
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={refresh}
      searchPlaceholder="Rechercher une catégorie…"
      searchFields={["name", "description"]}
      emptyValues={{
        name: "",
        description: "",
        imageUrl: "",
        displayOrder: 1,
        active: true,
      }}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onDeleteMany={handleDeleteMany}
      renderForm={CategoryForm}
    />
  );
}

function toPayload(values) {
  return {
    name: values.name?.trim() || null,
    description: values.description ?? null,
    imageUrl: values.imageUrl ?? null,
    displayOrder:
      values.displayOrder === "" || values.displayOrder == null
        ? null
        : Number(values.displayOrder),
    active: values.active === undefined ? true : Boolean(values.active),
  };
}

function CategoryForm({ initialValues, onSubmit, onCancel, mode }) {
  const [values, setValues] = useState({
    name: initialValues.name ?? "",
    description: initialValues.description ?? "",
    imageUrl: initialValues.imageUrl ?? "",
    displayOrder: initialValues.displayOrder ?? 1,
    active: initialValues.active ?? true,
  });

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!values.name.trim()) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nom *</label>
          <input
            className={styles.input}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Ordre d'affichage *</label>
          <input
            type="number"
            min="1"
            className={styles.input}
            value={values.displayOrder}
            onChange={(e) => update("displayOrder", e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>URL image</label>
          <input
            className={styles.input}
            value={values.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Active</label>
          <select
            className={styles.select}
            value={values.active ? "true" : "false"}
            onChange={(e) => update("active", e.target.value === "true")}
          >
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </div>
      </div>
      <div className={styles.formGroup} style={{ marginTop: "0.85rem" }}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
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
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          {mode === "create" ? "Créer" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
