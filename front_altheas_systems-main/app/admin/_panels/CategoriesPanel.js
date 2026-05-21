"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { categoriesApi } from "../_services/adminApi";
import { API_CONFIG } from "../../../services/config";

// Aligné avec com.althea.shared.model.Category :
//   { id, name, description, imageUrl, displayOrder, active,
//     createdAt, updatedAt }
// L'image catalogue est enregistrée en Mongo (multipart) comme pour les produits ;
// imageUrl stocke alors /images/{idMongo}.

function categoryImagePreviewUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  const base = API_CONFIG.catalogBaseUrl.replace(/\/$/, "");
  return `${base}${path}`;
}

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
    {
      key: "imageUrl",
      label: "Image",
      width: "72px",
      render: (row) => {
        const src = categoryImagePreviewUrl(row.imageUrl);
        if (!src) return <span className={styles.helperText}>—</span>;
        return (
          <img
            src={src}
            alt=""
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
            }}
          />
        );
      },
    },
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
        displayOrder: 1,
        active: true,
      }}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onDeleteMany={handleDeleteMany}
      renderForm={CategoryForm}
      renderDetail={(row, detailCtx) => (
        <CategoryDetail category={row} detailContext={detailCtx} />
      )}
    />
  );
}

/** Sans imageUrl : l'image est gérée uniquement depuis la vue Détail (upload fichier). */
function toPayload(values) {
  return {
    name: values.name?.trim() || null,
    description: values.description ?? null,
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
      {mode === "create" && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#64748b" }}>
          Après création, ouvrez <strong>Détails</strong> pour ajouter une image
          fichier (MongoDB, comme pour les produits).
        </p>
      )}
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

function CategoryDetail({ category, detailContext }) {
  const { onRefresh, replaceActiveRow } = detailContext ?? {};
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingImg, setDeletingImg] = useState(false);

  const previewSrc = categoryImagePreviewUrl(category?.imageUrl);

  async function handleImageFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || category?.id == null) return;

    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await categoriesApi.uploadCategoryImageFile(category.id, fd);
      const fresh = await categoriesApi.get(category.id);
      replaceActiveRow?.(fresh);
      await onRefresh?.();
    } catch (err) {
      setUploadError(err?.message ?? String(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    if (category?.id == null) return;
    setUploadError(null);
    setDeletingImg(true);
    try {
      const fresh = await categoriesApi.deleteUploadedImage(category.id);
      replaceActiveRow?.(fresh);
      await onRefresh?.();
    } catch (err) {
      setUploadError(err?.message ?? String(err));
    } finally {
      setDeletingImg(false);
    }
  }

  return (
    <div className={styles.detailGrid}>
      <Detail label="ID" value={category.id} />
      <Detail label="Nom" value={category.name} />
      <Detail label="Ordre" value={category.displayOrder} />
      <Detail label="Active" value={category.active ? "Oui" : "Non"} />
      <Detail label="Image (URL catalogue)" value={category.imageUrl || "—"} />
      <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
        <span className={styles.detailLabel}>Description</span>
        <span className={styles.detailValue}>
          {category.description || "—"}
        </span>
      </div>

      <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
        <span className={styles.detailLabel}>Aperçu</span>
        <div style={{ marginTop: "0.35rem" }}>
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={category.name}
              style={{
                maxWidth: 240,
                maxHeight: 160,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
            />
          ) : (
            <span className={styles.helperText}>Aucune image</span>
          )}
        </div>
      </div>

      <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
        <span className={styles.detailLabel}>Image fichier</span>
        <div style={{ marginTop: "0.35rem" }}>
          <input
            type="file"
            accept="image/*"
            disabled={uploading || deletingImg}
            onChange={handleImageFileSelected}
            aria-busy={uploading}
          />
          {(uploading || deletingImg) && (
            <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>
              …
            </span>
          )}
          {previewSrc &&
            typeof category.imageUrl === "string" &&
            category.imageUrl.startsWith("/images/") && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}
                disabled={uploading || deletingImg}
                onClick={handleRemoveImage}
              >
                Supprimer l&apos;image
              </button>
            )}
          {uploadError && (
            <div
              style={{
                marginTop: "0.4rem",
                color: "#b91c1c",
                fontSize: "0.85rem",
              }}
            >
              {uploadError}
            </div>
          )}
          <p style={{ marginTop: "0.35rem", fontSize: "0.78rem", color: "#64748b" }}>
            Même mécanisme que les produits : fichier stocké dans MongoDB, servi par
            le catalogue ({API_CONFIG.catalogBaseUrl}
            /images/…).
          </p>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value ?? "—"}</span>
    </div>
  );
}
