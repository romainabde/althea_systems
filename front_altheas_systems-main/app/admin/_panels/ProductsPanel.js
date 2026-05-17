"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { categoriesApi, productsApi } from "../_services/adminApi";
import { API_CONFIG } from "../../../services/config";

// Le back renvoie List<ProductWithImagesDto> :
//   { product: ProductDto, images: ProductImage[] }
// On aplatit en une ligne par produit pour le tableau.

function flattenProducts(data) {
  if (!Array.isArray(data)) return [];
  return data.map((entry) => toFlatProduct(entry)).filter(Boolean);
}

function toFlatProduct(entry) {
  if (!entry) return null;
  if (entry.product) {
    return {
      ...entry.product,
      _images: entry.images ?? [],
    };
  }
  return entry;
}

function catalogImageSrc(img) {
  if (!img) return null;
  const path =
    typeof img.url === "string" && img.url.startsWith("/")
      ? img.url
      : img.id
        ? `/images/${img.id}`
        : null;
  if (!path) return null;
  const base = API_CONFIG.catalogBaseUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function ProductsPanel() {
  const { rows, loading, error, refresh, run } = useResource(
    productsApi.list,
    { transform: flattenProducts }
  );
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesApi
      .list()
      .then((res) => setCategories(Array.isArray(res) ? res : []))
      .catch(() => setCategories([]));
  }, []);

  function handleCreate(values) {
    return run(() => productsApi.create(toCreatePayload(values)));
  }
  function handleUpdate(id, values) {
    return run(() => productsApi.update(id, toUpdatePayload(values)));
  }
  function handleDelete(id) {
    return run(() => productsApi.remove(id));
  }
  function handleDeleteMany(ids) {
    return run(() => productsApi.removeMany(ids));
  }

  const columns = [
    { key: "id", label: "ID", width: "80px" },
    { key: "name", label: "Nom" },
    {
      key: "categoryName",
      label: "Catégorie",
      width: "150px",
      accessor: (row) => row.categoryName ?? "",
    },
    {
      key: "price",
      label: "Prix",
      width: "120px",
      accessor: (row) => Number(row.price ?? 0),
      render: (row) => `${formatNumber(row.price)} €`,
    },
    {
      key: "stock",
      label: "Stock",
      width: "90px",
      accessor: (row) => row.stock ?? 0,
    },
    {
      key: "displayPriority",
      label: "Priorité",
      width: "90px",
      accessor: (row) => row.displayPriority ?? 0,
    },
    {
      key: "active",
      label: "Statut",
      width: "100px",
      accessor: (row) => (row.active ? 1 : 0),
      render: (row) => (
        <span
          className={`${styles.badge} ${
            row.active ? styles.badgeSuccess : styles.badgeDanger
          }`}
        >
          {row.active ? "Actif" : "Inactif"}
        </span>
      ),
    },
  ];

  return (
    <ResourcePanel
      title="Produits"
      subtitle="Catalogue : ajouter, modifier, supprimer des produits."
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={refresh}
      searchPlaceholder="Rechercher (nom, catégorie)…"
      searchFields={["name", "categoryName", "description"]}
      emptyValues={{
        name: "",
        description: "",
        price: "",
        stock: "",
        displayPriority: 0,
        active: true,
        categoryId: categories[0]?.id ?? "",
      }}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onDeleteMany={handleDeleteMany}
      renderForm={(props) => (
        <ProductForm {...props} categories={categories} />
      )}
      renderDetail={(row, detailCtx) => (
        <ProductDetail product={row} detailContext={detailCtx} />
      )}
    />
  );
}

function toCreatePayload(values) {
  return {
    name: values.name?.trim(),
    description: values.description ?? null,
    price: values.price === "" ? null : Number(values.price),
    stock: values.stock === "" ? 0 : Number(values.stock),
    displayPriority:
      values.displayPriority === "" || values.displayPriority == null
        ? null
        : Number(values.displayPriority),
    active: values.active === undefined ? true : Boolean(values.active),
    categoryId: values.categoryId === "" ? null : Number(values.categoryId),
  };
}

function toUpdatePayload(values) {
  // PUT /admin/products/{id} ignore les champs null (BeanMapping IGNORE)
  return toCreatePayload(values);
}

function formatNumber(n) {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function ProductForm({
  initialValues,
  onSubmit,
  onCancel,
  mode,
  categories,
}) {
  const [values, setValues] = useState({
    name: initialValues.name ?? "",
    description: initialValues.description ?? "",
    price: initialValues.price ?? "",
    stock: initialValues.stock ?? 0,
    displayPriority: initialValues.displayPriority ?? 0,
    active: initialValues.active ?? true,
    categoryId:
      initialValues.categoryId ?? categories?.[0]?.id ?? "",
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
          <label className={styles.label}>Nom du produit *</label>
          <input
            className={styles.input}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Catégorie *</label>
          <select
            className={styles.select}
            value={values.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            required
          >
            <option value="">— Choisir —</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Prix (€) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className={styles.input}
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Quantité en stock *</label>
          <input
            type="number"
            min="0"
            step="1"
            className={styles.input}
            value={values.stock}
            onChange={(e) => update("stock", e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Priorité d'affichage</label>
          <input
            type="number"
            min="0"
            step="1"
            className={styles.input}
            value={values.displayPriority}
            onChange={(e) => update("displayPriority", e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Actif</label>
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

function ProductDetail({ product, detailContext }) {
  const { onRefresh, replaceActiveRow } = detailContext ?? {};
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleImageFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || product?.id == null) return;

    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await productsApi.addImageFile(product.id, fd);
      const fresh = await productsApi.get(product.id);
      const flat = toFlatProduct(fresh);
      if (flat) replaceActiveRow?.(flat);
      await onRefresh?.();
    } catch (err) {
      setUploadError(err?.message ?? String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.detailGrid}>
      <Detail label="ID" value={product.id} />
      <Detail label="Nom" value={product.name} />
      <Detail label="Catégorie" value={product.categoryName} />
      <Detail label="Prix" value={`${formatNumber(product.price)} €`} />
      <Detail label="Stock" value={product.stock} />
      <Detail label="Priorité" value={product.displayPriority} />
      <Detail label="Actif" value={product.active ? "Oui" : "Non"} />
      <Detail label="Créé le" value={product.createdAt} />
      <Detail label="Modifié le" value={product.updatedAt} />
      <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
        <span className={styles.detailLabel}>Description</span>
        <span className={styles.detailValue}>
          {product.description || "—"}
        </span>
      </div>

      <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
        <span className={styles.detailLabel}>Ajouter une image</span>
        <div style={{ marginTop: "0.35rem" }}>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleImageFileSelected}
            aria-busy={uploading}
          />
          {uploading && (
            <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>
              Envoi…
            </span>
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
            Le fichier est enregistré dans MongoDB Atlas ; affichage via le
            catalogue ({API_CONFIG.catalogBaseUrl}
            /images/…).
          </p>
        </div>
      </div>

      {Array.isArray(product._images) && product._images.length > 0 && (
        <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
          <span className={styles.detailLabel}>
            Images ({product._images.length})
          </span>
          <div
            style={{
              display: "flex",
              gap: "0.65rem",
              flexWrap: "wrap",
              marginTop: "0.4rem",
              alignItems: "flex-start",
            }}
          >
            {product._images.map((img) => {
              const src = catalogImageSrc(img);
              return (
                <div
                  key={img.id ?? img.url}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    maxWidth: "140px",
                  }}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL dynamique catalogue
                    <img
                      src={src}
                      alt={img.altText || ""}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  ) : null}
                  <code
                    style={{
                      fontSize: "0.72rem",
                      background: "#f1f5f9",
                      padding: "0.15rem 0.35rem",
                      borderRadius: "6px",
                      wordBreak: "break-all",
                    }}
                  >
                    {img.url || img.id || "—"}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
