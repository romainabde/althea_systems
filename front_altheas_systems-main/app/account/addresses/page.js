"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  AccountAlert,
  AccountEmptyState,
  AccountPageShell,
  accountCardStyle,
  accountDangerBtn,
  accountInputStyle,
  accountLabelStyle,
  accountPrimaryBtn,
  accountSecondaryBtn,
  accountSectionTitleStyle,
} from "../../../components/account/accountStyles";
import GuestAccountPrompt from "../../../components/account/GuestAccountPrompt";
import {
  createAddress,
  deleteAddress,
  fetchMyAddresses,
  updateAddress,
} from "../../../services/api/addressesApi";
import { getAuthToken } from "../../../services/authSession";

function formatAddressLines(addr) {
  const lines = [];
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(" ").trim();
  if (name) lines.push(name);
  if (addr.street) lines.push(addr.street);
  const cityLine = [addr.zipCode, addr.city].filter(Boolean).join(" ").trim();
  if (cityLine) lines.push(cityLine);
  if (addr.country) lines.push(addr.country);
  if (addr.phone) lines.push(`Tél. ${addr.phone}`);
  return lines;
}

function emptyDraft() {
  return {
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    zipCode: "",
    country: "",
    phone: "",
  };
}

function draftFromAddr(addr) {
  return {
    firstName: addr.firstName ?? "",
    lastName: addr.lastName ?? "",
    street: addr.street ?? "",
    city: addr.city ?? "",
    zipCode: addr.zipCode ?? "",
    country: addr.country ?? "",
    phone: addr.phone ?? "",
  };
}

function AddressFormFields({ draft, onChange }) {
  return (
    <div style={{ display: "grid", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <label style={accountLabelStyle}>
          Prénom
          <input
            value={draft.firstName}
            onChange={(e) => onChange({ ...draft, firstName: e.target.value })}
            required
            autoComplete="given-name"
            style={accountInputStyle}
          />
        </label>
        <label style={accountLabelStyle}>
          Nom
          <input
            value={draft.lastName}
            onChange={(e) => onChange({ ...draft, lastName: e.target.value })}
            required
            autoComplete="family-name"
            style={accountInputStyle}
          />
        </label>
      </div>
      <label style={accountLabelStyle}>
        Rue et numéro
        <input
          value={draft.street}
          onChange={(e) => onChange({ ...draft, street: e.target.value })}
          required
          autoComplete="street-address"
          style={accountInputStyle}
        />
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px" }}>
        <label style={accountLabelStyle}>
          Code postal
          <input
            value={draft.zipCode}
            onChange={(e) => onChange({ ...draft, zipCode: e.target.value })}
            required
            autoComplete="postal-code"
            style={accountInputStyle}
          />
        </label>
        <label style={accountLabelStyle}>
          Ville
          <input
            value={draft.city}
            onChange={(e) => onChange({ ...draft, city: e.target.value })}
            required
            autoComplete="address-level2"
            style={accountInputStyle}
          />
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <label style={accountLabelStyle}>
          Pays
          <input
            value={draft.country}
            onChange={(e) => onChange({ ...draft, country: e.target.value })}
            required
            autoComplete="country-name"
            style={accountInputStyle}
          />
        </label>
        <label style={accountLabelStyle}>
          Téléphone
          <input
            value={draft.phone}
            onChange={(e) => onChange({ ...draft, phone: e.target.value })}
            required
            type="tel"
            autoComplete="tel"
            style={accountInputStyle}
          />
        </label>
      </div>
    </div>
  );
}

export default function AccountAddressesPage() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyDraft());
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [newDraft, setNewDraft] = useState(emptyDraft());

  const loadAddresses = useCallback(async () => {
    if (!getAuthToken()) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchMyAddresses();
      setAddresses(list);
    } catch (e) {
      if (e?.status === 401 || e?.status === 403) {
        setError("Session expirée. Reconnectez-vous.");
      } else {
        setError(e?.message || "Impossible de charger les adresses.");
      }
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = !!getAuthToken();
    setLoggedIn(token);
    if (!token) {
      setLoading(false);
      setAddresses([]);
      return;
    }
    loadAddresses();
  }, [pathname, loadAddresses]);

  function startEdit(addr) {
    setEditingId(addr.id);
    setEditDraft(draftFromAddr(addr));
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(emptyDraft());
  }

  async function submitEdit(event) {
    event.preventDefault();
    if (editingId == null) return;
    setMessage("");
    setError("");
    setSavingEdit(true);
    try {
      await updateAddress(editingId, editDraft);
      setMessage("Adresse mise à jour.");
      cancelEdit();
      await loadAddresses();
    } catch (e) {
      setError(e?.message || "Impossible de mettre à jour l'adresse.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(addrId) {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Supprimer cette adresse ? Cette action est définitive.")
    ) {
      return;
    }
    setMessage("");
    setError("");
    setDeletingId(addrId);
    try {
      await deleteAddress(addrId);
      setMessage("Adresse supprimée.");
      if (editingId === addrId) cancelEdit();
      await loadAddresses();
    } catch (e) {
      setError(e?.message || "Impossible de supprimer l'adresse.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmitNew(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setLoggedIn(false);
      return;
    }

    setSubmitting(true);
    try {
      await createAddress(newDraft);
      setMessage("Adresse enregistrée.");
      setNewDraft(emptyDraft());
      await loadAddresses();
    } catch (e) {
      setError(e?.message || "Impossible d'enregistrer l'adresse.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loggedIn) {
    return (
      <AccountPageShell
        title="Mes adresses"
        subtitle="Enregistrez vos adresses de livraison et de facturation."
        icon="📍"
        accent="#0891b2"
      >
        <div style={{ ...accountCardStyle, padding: "32px" }}>
          <GuestAccountPrompt
            description="Connectez-vous ou créez un compte pour gérer vos adresses."
            nextPath="/account/addresses"
          />
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell
      title="Mes adresses"
      subtitle="Utilisées pour la livraison et la facturation de vos commandes."
      icon="📍"
      accent="#0891b2"
    >
      {message ? <AccountAlert type="success">{message}</AccountAlert> : null}
      {error ? <AccountAlert type="error">{error}</AccountAlert> : null}

      {loading ? (
        <div style={{ ...accountCardStyle, textAlign: "center", color: "#64748b" }}>
          Chargement…
        </div>
      ) : addresses.length === 0 ? (
        <AccountEmptyState
          icon="📍"
          title="Aucune adresse enregistrée"
          description="Ajoutez une adresse pour accélérer vos prochaines commandes."
        />
      ) : (
        <div style={{ display: "grid", gap: "14px", marginBottom: "28px" }}>
          {addresses.map((addr) => {
            const isEditing = editingId === addr.id;
            return (
              <article key={addr.id} style={accountCardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "1.3rem" }}>📍</span>
                  <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
                    Adresse #{addr.id}
                  </p>
                </div>

                {isEditing ? (
                  <form onSubmit={submitEdit}>
                    <AddressFormFields draft={editDraft} onChange={setEditDraft} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "18px" }}>
                      <button
                        type="submit"
                        disabled={savingEdit}
                        style={{
                          ...accountPrimaryBtn,
                          opacity: savingEdit ? 0.6 : 1,
                        }}
                      >
                        {savingEdit ? "Enregistrement…" : "Enregistrer"}
                      </button>
                      <button type="button" onClick={cancelEdit} disabled={savingEdit} style={accountSecondaryBtn}>
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div
                      style={{
                        padding: "14px 16px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "12px",
                        color: "#334155",
                        lineHeight: 1.6,
                        fontSize: "0.95rem",
                      }}
                    >
                      {formatAddressLines(addr).map((line, idx) => (
                        <div key={`${addr.id}-${idx}`}>{line}</div>
                      ))}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "16px" }}>
                      <button
                        type="button"
                        onClick={() => startEdit(addr)}
                        disabled={deletingId === addr.id}
                        style={{
                          ...accountSecondaryBtn,
                          opacity: deletingId === addr.id ? 0.5 : 1,
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                        style={{
                          ...accountDangerBtn,
                          opacity: deletingId === addr.id ? 0.5 : 1,
                        }}
                      >
                        {deletingId === addr.id ? "Suppression…" : "Supprimer"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div style={accountCardStyle}>
        <h2 style={accountSectionTitleStyle}>Ajouter une adresse</h2>
        <p style={{ margin: "0 0 18px 0", color: "#64748b", fontSize: "0.92rem" }}>
          Renseignez les informations de livraison ci-dessous.
        </p>
        <form onSubmit={handleSubmitNew} noValidate>
          <AddressFormFields draft={newDraft} onChange={setNewDraft} />
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...accountPrimaryBtn,
              width: "100%",
              marginTop: "20px",
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Enregistrement…" : "Enregistrer l'adresse"}
          </button>
        </form>
      </div>
    </AccountPageShell>
  );
}
