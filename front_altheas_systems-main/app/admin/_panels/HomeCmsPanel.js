"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../admin.module.css";
import DataTable from "../_components/DataTable";
import ConfirmDialog from "../_components/ConfirmDialog";
import { categoriesApi, homeCmsApi, productsApi } from "../_services/adminApi";
import { API_CONFIG } from "../../../services/config";

// =============================================================================
// HomeCmsPanel
// -----------------------------------------------------------------------------
// 4 sous-onglets :
//   - Carrousel       : entité CarouselSection { id, title, text, imageUrl,
//                       linkUrl, linkTargetType, targetCategoryId, targetProductId,
//                       displayOrder, active }
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

const LINK_TARGET_OPTIONS = [
  { value: "CUSTOM", label: "URL libre" },
  { value: "CATEGORY", label: "Page catégorie" },
  { value: "PRODUCT", label: "Page produit" },
];

function normalizeCarouselLinkTargetType(raw) {
  const t =
    raw != null && String(raw).trim() !== ""
      ? String(raw).trim().toUpperCase()
      : "CUSTOM";
  return LINK_TARGET_OPTIONS.some((o) => o.value === t) ? t : "CUSTOM";
}

/** Liste plate { id, name } depuis GET /admin/products (ProductWithImagesDto[]). */
function flattenProductsForCarousel(apiList) {
  if (!Array.isArray(apiList)) return [];
  return apiList
    .map((entry) => {
      const p = entry?.product ?? entry;
      if (p?.id == null) return null;
      return { id: p.id, name: p.name ?? "" };
    })
    .filter(Boolean);
}

function buildCarouselFormState(initialValues) {
  const lt = normalizeCarouselLinkTargetType(initialValues.linkTargetType);
  return {
    title: initialValues.title ?? "",
    text: initialValues.text ?? "",
    imageUrl: initialValues.imageUrl ?? "",
    linkUrl: initialValues.linkUrl ?? "",
    linkTargetType: lt,
    targetCategoryId:
      initialValues.targetCategoryId != null &&
      initialValues.targetCategoryId !== ""
        ? String(initialValues.targetCategoryId)
        : "",
    targetProductId:
      initialValues.targetProductId != null &&
      initialValues.targetProductId !== ""
        ? String(initialValues.targetProductId)
        : "",
    displayOrder: initialValues.displayOrder ?? 1,
    active: initialValues.active ?? true,
  };
}

/** URL absolue pour aperçu : chemins relatifs via API catalogue (/images/…). */
function carouselPreviewSrc(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const u = imageUrl.trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) {
    const base = API_CONFIG.catalogBaseUrl.replace(/\/$/, "");
    return `${base}${u}`;
  }
  return u;
}

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

  function toPayload(values) {
    const t = values.linkTargetType || "CUSTOM";
    const catId =
      t === "CATEGORY" &&
      values.targetCategoryId !== "" &&
      values.targetCategoryId != null
        ? Number(values.targetCategoryId)
        : null;
    const prodId =
      t === "PRODUCT" &&
      values.targetProductId !== "" &&
      values.targetProductId != null
        ? Number(values.targetProductId)
        : null;
    const linkTrim =
      values.linkUrl != null && String(values.linkUrl).trim() !== ""
        ? String(values.linkUrl).trim()
        : null;
    return {
      title: values.title?.trim() || null,
      text: values.text ?? null,
      imageUrl:
        values.imageUrl != null && String(values.imageUrl).trim() !== ""
          ? String(values.imageUrl).trim()
          : null,
      linkUrl: linkTrim,
      linkTargetType: t,
      targetCategoryId: catId,
      targetProductId: prodId,
      displayOrder:
        values.displayOrder === "" || values.displayOrder == null
          ? null
          : Number(values.displayOrder),
      active: values.active === undefined ? true : Boolean(values.active),
    };
  }

  const columns = [
    { key: "id", label: "ID", width: "70px" },
    { key: "title", label: "Titre" },
    {
      key: "linkTargetType",
      label: "Type lien",
      width: "100px",
      accessor: (row) => normalizeCarouselLinkTargetType(row.linkTargetType),
      render: (row) => {
        const t = normalizeCarouselLinkTargetType(row.linkTargetType);
        const short = { CUSTOM: "URL", CATEGORY: "Cat.", PRODUCT: "Prod." };
        return short[t] ?? t;
      },
    },
    {
      key: "targetSummary",
      label: "Cible",
      width: "90px",
      render: (row) => {
        const t = normalizeCarouselLinkTargetType(row.linkTargetType);
        if (t === "CATEGORY" && row.targetCategoryId != null)
          return `cat. ${row.targetCategoryId}`;
        if (t === "PRODUCT" && row.targetProductId != null)
          return `prd. ${row.targetProductId}`;
        return "—";
      },
    },
    { key: "linkUrl", label: "Lien (URL)" },
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
          key="carousel-create"
          mode="create"
          initialValues={{
            title: "",
            text: "",
            imageUrl: "",
            linkUrl: "",
            linkTargetType: "CUSTOM",
            targetCategoryId: "",
            targetProductId: "",
            displayOrder: rows.length + 1,
            active: true,
          }}
          onSubmit={handleCreate}
          onCancel={() => setView("list")}
          sectionId={null}
          onCarouselDirty={refresh}
        />
      )}

      {view === "edit" && active && (
        <CarouselForm
          key={`carousel-edit-${active.id}`}
          mode="edit"
          initialValues={active}
          onSubmit={(values) => handleUpdate(active.id, values)}
          onCancel={() => {
            setView("list");
            setActive(null);
          }}
          sectionId={active.id}
          onCarouselDirty={refresh}
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
}

function CarouselForm({
  initialValues,
  onSubmit,
  onCancel,
  mode,
  sectionId = null,
  onCarouselDirty,
}) {
  const [values, setValues] = useState(() => buildCarouselFormState(initialValues));
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [formError, setFormError] = useState(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          categoriesApi.list(),
          productsApi.list(),
        ]);
        if (!cancelled) {
          setCategories(Array.isArray(cats) ? cats : []);
          setProducts(flattenProductsForCarousel(prods));
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  function update(field, v) {
    setValues((prev) => ({ ...prev, [field]: v }));
  }

  function setLinkTargetType(next) {
    setValues((prev) => {
      const n = { ...prev, linkTargetType: next };
      if (next === "CUSTOM") {
        n.targetCategoryId = "";
        n.targetProductId = "";
      } else if (next === "CATEGORY") {
        n.targetProductId = "";
      } else if (next === "PRODUCT") {
        n.targetCategoryId = "";
      }
      return n;
    });
  }

  async function handleUploadCarouselFile() {
    const file = fileRef.current?.files?.[0];
    if (!file || sectionId == null) return;
    setFormError(null);
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const updated = await homeCmsApi.uploadCarouselSectionImage(sectionId, fd);
      update("imageUrl", updated.imageUrl ?? "");
      fileRef.current.value = "";
      onCarouselDirty?.();
    } catch (err) {
      setFormError(String(err.message ?? err));
    } finally {
      setUploadBusy(false);
    }
  }

  async function handleDeleteCarouselMongoImage() {
    if (sectionId == null) return;
    setFormError(null);
    setUploadBusy(true);
    try {
      const updated = await homeCmsApi.deleteCarouselSectionImage(sectionId);
      update("imageUrl", updated.imageUrl ?? "");
      onCarouselDirty?.();
    } catch (err) {
      setFormError(String(err.message ?? err));
    } finally {
      setUploadBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    setFormError(null);
    if (!values.title?.trim()) return;

    const t = values.linkTargetType || "CUSTOM";
    if (t === "CUSTOM" && !(values.linkUrl?.trim())) {
      setFormError(
        'Pour « URL libre », renseignez le champ lien (obligatoire côté serveur).'
      );
      return;
    }
    if (
      t === "CATEGORY" &&
      (values.targetCategoryId === "" || values.targetCategoryId == null)
    ) {
      setFormError("Choisissez une catégorie.");
      return;
    }
    if (
      t === "PRODUCT" &&
      (values.targetProductId === "" || values.targetProductId == null)
    ) {
      setFormError("Choisissez un produit.");
      return;
    }

    onSubmit(values);
  }

  const hintStyle = {
    fontSize: "0.82rem",
    color: "#64748b",
    marginTop: "0.35rem",
    lineHeight: 1.35,
  };

  return (
    <form onSubmit={submit}>
      {formError && (
        <div
          className={styles.bulkBar}
          style={{
            background: "#fee2e2",
            borderColor: "#dc2626",
            color: "#991b1b",
            marginBottom: "1rem",
          }}
        >
          ⚠ {formError}
        </div>
      )}
      <div className={styles.formGrid}>
        <Field label="Titre *">
          <input
            className={styles.input}
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </Field>
        <Field label="URL image (manuel – optionnel)">
          <input
            className={styles.input}
            value={values.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="/images/… ou https://…"
          />
          <p style={hintStyle}>
            Laissez vide puis créez la section : en modification, vous pouvez envoyer
            un fichier (Mongo, lien <code>/images/…</code>), comme pour les produits.
          </p>
        </Field>
        {sectionId != null && (
          <Field label="Fichier image (Mongo)">
            <div
              className={styles.btnRow}
              style={{
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                disabled={uploadBusy}
              />
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                disabled={uploadBusy}
                onClick={handleUploadCarouselFile}
              >
                {uploadBusy ? "…" : "Envoyer le fichier"}
              </button>
              {typeof values.imageUrl === "string" &&
                values.imageUrl.startsWith("/images/") && (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                    disabled={uploadBusy}
                    onClick={handleDeleteCarouselMongoImage}
                  >
                    Retirer l&apos;image Mongo
                  </button>
                )}
            </div>
          </Field>
        )}
        {carouselPreviewSrc(values.imageUrl) && (
          <Field label="Aperçu">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={carouselPreviewSrc(values.imageUrl)}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "180px",
                objectFit: "contain",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
          </Field>
        )}
        <Field label="Destination du clic *">
          <select
            className={styles.select}
            value={values.linkTargetType}
            onChange={(e) => setLinkTargetType(e.target.value)}
          >
            {LINK_TARGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p style={hintStyle}>
            URL libre : lien exact. Catégorie / produit : le catalogue peut
            compléter l’URL si vous laissez le champ lien vide (
            <code>/categories/…</code>, <code>/products/…</code>).
          </p>
        </Field>

        {values.linkTargetType === "CUSTOM" && (
          <Field label="Lien (URL) *">
            <input
              className={styles.input}
              value={values.linkUrl}
              onChange={(e) => update("linkUrl", e.target.value)}
              placeholder="https://… ou /chemin-interne"
              required
            />
          </Field>
        )}

        {values.linkTargetType === "CATEGORY" && (
          <Field label="Catégorie *">
            <select
              className={styles.select}
              disabled={optionsLoading}
              value={values.targetCategoryId === "" ? "" : String(values.targetCategoryId)}
              onChange={(e) => update("targetCategoryId", e.target.value)}
              required
            >
              <option value="">
                {optionsLoading ? "Chargement…" : "— Choisir une catégorie —"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  #{c.id} — {c.name ?? "?"}
                </option>
              ))}
            </select>
            <p style={hintStyle}>
              Optionnel : URL personnalisée ci‑dessous (sinon dérivée du front /
              catalogue).
            </p>
          </Field>
        )}

        {values.linkTargetType === "PRODUCT" && (
          <Field label="Produit *">
            <select
              className={styles.select}
              disabled={optionsLoading}
              value={values.targetProductId === "" ? "" : String(values.targetProductId)}
              onChange={(e) => update("targetProductId", e.target.value)}
              required
            >
              <option value="">
                {optionsLoading ? "Chargement…" : "— Choisir un produit —"}
              </option>
              {products.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  #{p.id} — {p.name || "(sans nom)"}
                </option>
              ))}
            </select>
            <p style={hintStyle}>
              Liste chargée depuis le catalogue admin (tous les produits).
              Optionnel : URL personnalisée ci‑dessous.
            </p>
          </Field>
        )}

        {(values.linkTargetType === "CATEGORY" ||
          values.linkTargetType === "PRODUCT") && (
          <Field label="Lien (URL) — optionnel">
            <input
              className={styles.input}
              value={values.linkUrl}
              onChange={(e) => update("linkUrl", e.target.value)}
              placeholder="Laisser vide pour lien automatique vers la page"
            />
          </Field>
        )}

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
