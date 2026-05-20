"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import GuestAccountPrompt from "../../../components/account/GuestAccountPrompt";
import {
  createAddress,
  deleteAddress,
  fetchMyAddresses,
  updateAddress,
} from "../../../services/api/addressesApi";
import { getAuthToken } from "../../../services/authSession";

const pageStyle = {
  padding: "1rem",
  maxWidth: "640px",
  margin: "0 auto",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "1rem",
  marginTop: "1rem",
  background: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "0.95rem",
  boxSizing: "border-box",
};

const buttonStyle = {
  marginTop: "1rem",
  width: "100%",
  padding: "0.85rem 1rem",
  border: "none",
  borderRadius: "8px",
  background: "#003d5c",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const rowActionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  marginTop: "0.85rem",
};

const btnSecondary = {
  padding: "0.45rem 0.85rem",
  borderRadius: "8px",
  border: "2px solid #003d5c",
  background: "#fff",
  color: "#003d5c",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};

const btnDanger = {
  ...btnSecondary,
  borderColor: "#b91c1c",
  color: "#b91c1c",
};

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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

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
      setError(e?.message || "Impossible de mettre à jour l’adresse.");
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
      setError(e?.message || "Impossible de supprimer l’adresse.");
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
      await createAddress({
        firstName,
        lastName,
        street,
        city,
        zipCode,
        country,
        phone,
      });
      setMessage("Adresse enregistrée.");
      setFirstName("");
      setLastName("");
      setStreet("");
      setCity("");
      setZipCode("");
      setCountry("");
      setPhone("");
      await loadAddresses();
    } catch (e) {
      setError(e?.message || "Impossible d’enregistrer l’adresse.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loggedIn) {
    return (
      <section style={pageStyle}>
        <h1 style={{ marginBottom: "0.35rem" }}>Mes adresses</h1>
        <p style={{ marginTop: 0, color: "#555" }}>
          Enregistrez des adresses pour la livraison et la facturation de vos commandes.
        </p>
        <article style={cardStyle}>
          <GuestAccountPrompt
            description="Connectez-vous ou créez un compte pour gérer vos adresses."
            nextPath="/account/addresses"
          />
        </article>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Mes adresses</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Ces adresses sont utilisées pour la livraison et la facturation. Une adresse déjà utilisée pour une
        commande ne peut pas être supprimée.
      </p>

      {loading ? (
        <article style={cardStyle}>
          <p style={{ margin: 0 }}>Chargement…</p>
        </article>
      ) : error ? (
        <article style={{ ...cardStyle, borderColor: "#fca5a5" }}>
          <p style={{ margin: 0, color: "#b91c1c" }}>{error}</p>
        </article>
      ) : addresses.length === 0 ? (
        <article style={cardStyle}>
          <p style={{ margin: 0 }}>Vous n&apos;avez pas encore enregistré d&apos;adresse.</p>
        </article>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          {addresses.map((addr) => {
            const isEditing = editingId === addr.id;
            return (
              <article key={addr.id} style={cardStyle}>
                <p style={{ margin: 0, fontWeight: 700 }}>Adresse n°{addr.id}</p>

                {isEditing ? (
                  <form onSubmit={submitEdit} style={{ marginTop: "0.75rem" }}>
                    <div style={{ display: "grid", gap: "0.65rem" }}>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.9rem" }}>
                        Prénom
                        <input
                          value={editDraft.firstName}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, firstName: e.target.value }))
                          }
                          required
                          style={inputStyle}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.9rem" }}>
                        Nom
                        <input
                          value={editDraft.lastName}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, lastName: e.target.value }))
                          }
                          required
                          style={inputStyle}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.9rem" }}>
                        Rue et numéro
                        <input
                          value={editDraft.street}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, street: e.target.value }))
                          }
                          required
                          style={inputStyle}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.9rem" }}>
                        Code postal
                        <input
                          value={editDraft.zipCode}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, zipCode: e.target.value }))
                          }
                          required
                          style={inputStyle}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.9rem" }}>
                        Ville
                        <input
                          value={editDraft.city}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, city: e.target.value }))
                          }
                          required
                          style={inputStyle}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.9rem" }}>
                        Pays
                        <input
                          value={editDraft.country}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, country: e.target.value }))
                          }
                          required
                          style={inputStyle}
                        />
                      </label>
                      <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.9rem" }}>
                        Téléphone
                        <input
                          value={editDraft.phone}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, phone: e.target.value }))
                          }
                          required
                          type="tel"
                          style={inputStyle}
                        />
                      </label>
                    </div>
                    <div style={rowActionsStyle}>
                      <button
                        type="submit"
                        disabled={savingEdit}
                        style={{ ...btnSecondary, opacity: savingEdit ? 0.6 : 1 }}
                      >
                        {savingEdit ? "Enregistrement…" : "Enregistrer"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        style={btnSecondary}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ marginTop: "0.5rem", color: "#334155", lineHeight: 1.5 }}>
                      {formatAddressLines(addr).map((line, idx) => (
                        <div key={`${addr.id}-${idx}`}>{line}</div>
                      ))}
                    </div>
                    <div style={rowActionsStyle}>
                      <button
                        type="button"
                        onClick={() => startEdit(addr)}
                        disabled={deletingId === addr.id}
                        style={{
                          ...btnSecondary,
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
                          ...btnDanger,
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

      {message ? (
        <p style={{ marginTop: "1rem", color: "#15803d", fontWeight: 600 }}>{message}</p>
      ) : null}

      <h2 style={{ marginTop: "1.75rem", marginBottom: "0.35rem", fontSize: "1.05rem" }}>
        Ajouter une adresse
      </h2>
      <form onSubmit={handleSubmitNew} noValidate style={cardStyle}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            Prénom
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            Nom
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            Rue et numéro
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              autoComplete="street-address"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            Code postal
            <input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              autoComplete="postal-code"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            Ville
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              autoComplete="address-level2"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            Pays
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              autoComplete="country-name"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            Téléphone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              autoComplete="tel"
              style={inputStyle}
            />
          </label>
        </div>
        {submitting ? (
          <p style={{ marginTop: "1rem", marginBottom: 0 }}>Enregistrement…</p>
        ) : (
          <button type="submit" style={buttonStyle}>
            Enregistrer l&apos;adresse
          </button>
        )}
      </form>

      <Link
        href="/account"
        style={{
          display: "inline-block",
          marginTop: "1.25rem",
          color: "#003d5c",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Retour au compte
      </Link>
    </section>
  );
}
