"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";
import ResourcePanel from "../_components/ResourcePanel";
import useResource from "../_components/useResource";
import { categoriesApi, productsApi } from "../_services/adminApi";

// Le back renvoie List<ProductWithImagesDto> :
//   { product: ProductDto, images: ProductImage[] }
// On aplatit en une ligne par produit pour le tableau.

function flattenProducts(data) {
  if (!Array.isArray(data)) return [];
  return data.map((entry) => {
    if (entry && entry.product) {
      return {
        ...entry.product,
        _images: entry.images ?? [],
      };
    }
    return entry;
  });
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
      renderDetail={ProductDetail}
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

function ProductDetail(product) {
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
      {Array.isArray(product._images) && product._images.length > 0 && (
        <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
          <span className={styles.detailLabel}>
            Images ({product._images.length})
          </span>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginTop: "0.3rem",
            }}
          >
            {product._images.map((img) => (
              <code
                key={img.id ?? img.url}
                style={{
                  fontSize: "0.78rem",
                  background: "#f1f5f9",
                  padding: "0.2rem 0.45rem",
                  borderRadius: "6px",
                }}
              >
                {img.url}
              </code>
            ))}
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
