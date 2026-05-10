"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";
import DataTable from "../_components/DataTable";
import ConfirmDialog from "../_components/ConfirmDialog";
import { homeCmsApi } from "../_services/adminApi";

// =============================================================================
// HomeCmsPanel
// -----------------------------------------------------------------------------
// 4 sous-onglets :
//   - Carrousel       : entité CarouselSection { id, title, text, imageUrl,
//                       linkUrl, displayOrder, active }
//   - Texte d'accueil : entité HomepageText    { id, content, active }
//   - Top produits    : entité TopProduct      { id, product, displayOrder, active }
//   - Footer          : entité Footer          { id, content, active }
// =============================================================================

const SUB_TABS = [
  { id: "carousel", label: "Carrousel" },
  { id: "text", label: "Texte d'accueil" },
  { id: "top-products", label: "Top produits" },
  { id: "footer", label: "Footer" },
];

export default function HomeCmsPanel() {
  const [tab, setTab] = useState("carousel");

  return (
    <div>
      <div className={styles.contentHeader}>
        <div>
          <h1 className={styles.contentTitle}>Page d'accueil – CMS</h1>
          <p className={styles.contentSubtitle}>
            Gérez les blocs visibles sur la page d'accueil du site.
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {SUB_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.btn} ${
                tab === t.id ? styles.btnPrimary : styles.btnGhost
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "carousel" && <CarouselSubPanel />}
      {tab === "text" && <HomepageTextSubPanel />}
      {tab === "top-products" && <TopProductsSubPanel />}
      {tab === "footer" && <FooterSubPanel />}
    </div>
  );
}

// ----------------------------------------------------------------------------
// CARROUSEL
// ----------------------------------------------------------------------------

function CarouselSubPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [view, setView] = useState("list");
  const [active, setActive] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [selected, setSelected] = useState([]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await homeCmsApi.getCarousel();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(values) {
    try {
      await homeCmsApi.createCarouselSection(toPayload(values));
      await refresh();
      setView("list");
    } catch (e) {
      setError(e);
    }
  }

  async function handleUpdate(id, values) {
    try {
      await homeCmsApi.updateCarouselSection(id, toPayload(values));
      await refresh();
      setView("list");
      setActive(null);
    } catch (e) {
      setError(e);
    }
  }

  async function handleDelete() {
    if (confirmId == null) return;
    try {
      await homeCmsApi.deleteCarouselSection(confirmId);
      await refresh();
    } catch (e) {
      setError(e);
    } finally {
      setConfirmId(null);
    }
  }

  async function handleDeleteMany() {
    try {
      await Promise.all(
        selected.map((id) => homeCmsApi.deleteCarouselSection(id))
      );
      setSelected([]);
      await refresh();
    } catch (e) {
      setError(e);
    }
  }

  const columns = [
    { key: "id", label: "ID", width: "70px" },
    { key: "title", label: "Titre" },
    { key: "linkUrl", label: "Lien" },
    {
      key: "displayOrder",
      label: "Ordre",
      width: "80px",
      accessor: (row) => row.displayOrder ?? 0,
    },
    {
      key: "active",
      label: "Actif",
      width: "80px",
      accessor: (row) => (row.active ? 1 : 0),
      render: (row) => (row.active ? "Oui" : "Non"),
    },
    {
      key: "__actions",
      label: "Actions",
      sortable: false,
      width: "180px",
      render: (row) => (
        <div className={styles.btnRow} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSm} ${styles.btnAccent}`}
            onClick={() => {
              setActive(row);
              setView("edit");
            }}
          >
            Modifier
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
            onClick={() => setConfirmId(row.id)}
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Sections du carrousel</h2>
        <div className={styles.btnRow}>
          {view === "list" ? (
            <>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={refresh}
                disabled={loading}
              >
                {loading ? "…" : "↻ Rafraîchir"}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setView("create")}
              >
                + Nouvelle section
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => {
                setView("list");
                setActive(null);
              }}
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
          ⚠ {String(error.message ?? error)}
        </div>
      )}

      {view === "list" && (
        <>
          {selected.length > 0 && (
            <div className={styles.bulkBar}>
              <span>{selected.length} sélectionné(s)</span>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                onClick={handleDeleteMany}
              >
                Supprimer la sélection
              </button>
            </div>
          )}
          <DataTable
            columns={columns}
            rows={rows}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            emptyMessage={loading ? "Chargement…" : "Aucune section."}
          />
        </>
      )}

      {view === "create" && (
        <CarouselForm
          mode="create"
          initialValues={{
            title: "",
            text: "",
            imageUrl: "",
            linkUrl: "",
            displayOrder: rows.length + 1,
            active: true,
          }}
          onSubmit={handleCreate}
          onCancel={() => setView("list")}
        />
      )}

      {view === "edit" && active && (
        <CarouselForm
          mode="edit"
          initialValues={active}
          onSubmit={(values) => handleUpdate(active.id, values)}
          onCancel={() => {
            setView("list");
            setActive(null);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmId != null}
        title="Supprimer cette section ?"
        message="Le visuel ne s'affichera plus sur la page d'accueil."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );

  function toPayload(values) {
    return {
      title: values.title?.trim() || null,
      text: values.text ?? null,
      imageUrl: values.imageUrl ?? null,
      linkUrl: values.linkUrl ?? null,
      displayOrder:
        values.displayOrder === "" || values.displayOrder == null
          ? null
          : Number(values.displayOrder),
      active: values.active === undefined ? true : Boolean(values.active),
    };
  }
}

function CarouselForm({ initialValues, onSubmit, onCancel, mode }) {
  const [values, setValues] = useState({
    title: initialValues.title ?? "",
    text: initialValues.text ?? "",
    imageUrl: initialValues.imageUrl ?? "",
    linkUrl: initialValues.linkUrl ?? "",
    displayOrder: initialValues.displayOrder ?? 1,
    active: initialValues.active ?? true,
  });

  function update(field, v) {
    setValues((prev) => ({ ...prev, [field]: v }));
  }

  function submit(e) {
    e.preventDefault();
    if (!values.title?.trim()) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={submit}>
      <div className={styles.formGrid}>
        <Field label="Titre *">
          <input
            className={styles.input}
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </Field>
        <Field label="URL image *">
          <input
            className={styles.input}
            value={values.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="/images/banner.jpg"
            required
          />
        </Field>
        <Field label="Lien (URL) *">
          <input
            className={styles.input}
            value={values.linkUrl}
            onChange={(e) => update("linkUrl", e.target.value)}
            required
          />
        </Field>
        <Field label="Ordre d'affichage *">
          <input
            type="number"
            min="1"
            className={styles.input}
            value={values.displayOrder}
            onChange={(e) => update("displayOrder", e.target.value)}
            required
          />
        </Field>
        <Field label="Active">
          <select
            className={styles.select}
            value={values.active ? "true" : "false"}
            onChange={(e) => update("active", e.target.value === "true")}
          >
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </Field>
      </div>
      <Field label="Texte / accroche *">
        <textarea
          className={styles.textarea}
          value={values.text}
          onChange={(e) => update("text", e.target.value)}
          required
        />
      </Field>
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

// ----------------------------------------------------------------------------
// TEXTE D'ACCUEIL — entité avec un seul champ "content"
// ----------------------------------------------------------------------------

function HomepageTextSubPanel() {
  const [content, setContent] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await homeCmsApi.getHomepageText();
      setContent(data?.content ?? "");
      setActive(data?.active ?? true);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await homeCmsApi.updateHomepageText({ content, active });
      setSuccess(true);
    } catch (e) {
      setError(e);
    }
  }

  return (
    <form onSubmit={submit} className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Texte de la page d'accueil</h2>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={load}
          disabled={loading}
        >
          {loading ? "…" : "↻"}
        </button>
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
          ⚠ {String(error.message ?? error)}
        </div>
      )}
      {success && (
        <div className={styles.bulkBar}>✓ Enregistré.</div>
      )}

      <Field label="Contenu (texte / HTML libre) *">
        <textarea
          className={styles.textarea}
          style={{ minHeight: "180px" }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </Field>
      <Field label="Actif">
        <select
          className={styles.select}
          value={active ? "true" : "false"}
          onChange={(e) => setActive(e.target.value === "true")}
        >
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </Field>
      <div className={styles.formActions}>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------------
// TOP PRODUITS — entité TopProduct(productId, displayOrder, active)
// ----------------------------------------------------------------------------

function TopProductsSubPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [draft, setDraft] = useState({
    productId: "",
    displayOrder: 1,
    active: true,
  });
  const [confirmId, setConfirmId] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await homeCmsApi.getTopProducts();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!draft.productId) return;
    try {
      await homeCmsApi.addTopProduct({
        productId: Number(draft.productId),
        displayOrder:
          draft.displayOrder === "" ? null : Number(draft.displayOrder),
        active: Boolean(draft.active),
      });
      setDraft({ productId: "", displayOrder: rows.length + 2, active: true });
      await refresh();
    } catch (e) {
      setError(e);
    }
  }

  async function handleRemove() {
    if (confirmId == null) return;
    try {
      await homeCmsApi.removeTopProduct(confirmId);
      await refresh();
    } catch (e) {
      setError(e);
    } finally {
      setConfirmId(null);
    }
  }

  const columns = [
    { key: "id", label: "ID", width: "70px" },
    {
      key: "productId",
      label: "Produit",
      accessor: (row) => row.product?.id ?? "?",
      render: (row) => {
        const p = row.product;
        if (!p) return "—";
        return `#${p.id} – ${p.name ?? "?"}`;
      },
    },
    {
      key: "displayOrder",
      label: "Ordre",
      width: "100px",
      accessor: (row) => row.displayOrder ?? 0,
    },
    {
      key: "active",
      label: "Actif",
      width: "80px",
      accessor: (row) => (row.active ? 1 : 0),
      render: (row) => (row.active ? "Oui" : "Non"),
    },
    {
      key: "__actions",
      label: "Actions",
      sortable: false,
      width: "120px",
      render: (row) => (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
          onClick={() => setConfirmId(row.id)}
        >
          Retirer
        </button>
      ),
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Produits mis en avant</h2>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "…" : "↻"}
        </button>
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
          ⚠ {String(error.message ?? error)}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        style={{
          background: "#f8fafc",
          padding: "0.85rem",
          borderRadius: "10px",
          marginBottom: "1rem",
        }}
      >
        <div className={styles.formGrid}>
          <Field label="ID du produit *">
            <input
              type="number"
              min="1"
              className={styles.input}
              value={draft.productId}
              onChange={(e) =>
                setDraft({ ...draft, productId: e.target.value })
              }
              required
            />
          </Field>
          <Field label="Ordre d'affichage">
            <input
              type="number"
              min="1"
              className={styles.input}
              value={draft.displayOrder}
              onChange={(e) =>
                setDraft({ ...draft, displayOrder: e.target.value })
              }
            />
          </Field>
          <Field label="Actif">
            <select
              className={styles.select}
              value={draft.active ? "true" : "false"}
              onChange={(e) =>
                setDraft({ ...draft, active: e.target.value === "true" })
              }
            >
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </Field>
        </div>
        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Ajouter au top
          </button>
        </div>
      </form>

      <DataTable
        columns={columns}
        rows={rows}
        emptyMessage={loading ? "Chargement…" : "Aucun produit mis en avant."}
      />

      <ConfirmDialog
        open={confirmId != null}
        title="Retirer ce produit du top ?"
        message="Il ne sera plus affiché sur la page d'accueil."
        onConfirm={handleRemove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// FOOTER — entité avec un seul champ "content"
// ----------------------------------------------------------------------------

function FooterSubPanel() {
  const [content, setContent] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await homeCmsApi.getFooter();
      setContent(data?.content ?? "");
      setActive(data?.active ?? true);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await homeCmsApi.updateFooter({ content, active });
      setSuccess(true);
    } catch (e) {
      setError(e);
    }
  }

  return (
    <form onSubmit={submit} className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Pied de page (footer)</h2>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={load}
          disabled={loading}
        >
          {loading ? "…" : "↻"}
        </button>
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
          ⚠ {String(error.message ?? error)}
        </div>
      )}
      {success && <div className={styles.bulkBar}>✓ Enregistré.</div>}

      <Field label="Contenu (texte / HTML libre) *">
        <textarea
          className={styles.textarea}
          style={{ minHeight: "150px" }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </Field>
      <Field label="Actif">
        <select
          className={styles.select}
          value={active ? "true" : "false"}
          onChange={(e) => setActive(e.target.value === "true")}
        >
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </Field>
      <div className={styles.formActions}>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------------
// helpers
// ----------------------------------------------------------------------------

function Field({ label, children }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}
