"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import GuestAccountPrompt from "../../../components/account/GuestAccountPrompt";
import { updateUserProfile } from "../../../services/api/userApi";
import { getAuthToken, getAuthUser, patchStoredAuthUser } from "../../../services/authSession";

const pageStyle = {
  padding: "1rem",
  maxWidth: "560px",
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

const pwdRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function AccountSettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      setNeedsLogin(true);
      return;
    }
    const u = getAuthUser();
    if (u) {
      setFullName(typeof u.fullName === "string" ? u.fullName : "");
      setEmail(typeof u.email === "string" ? u.email : "");
    }
    setNeedsLogin(false);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setNeedsLogin(true);
      setError("Session expirée. Reconnectez-vous.");
      return;
    }

    const wantsPasswordChange =
      newPassword.trim() !== "" || confirmPassword.trim() !== "";

    if (wantsPasswordChange) {
      if (!currentPassword) {
        setError("L’ancien mot de passe est obligatoire pour en définir un nouveau.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
      if (!pwdRegex.test(newPassword)) {
        setError(
          "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)."
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      };
      if (wantsPasswordChange) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const data = await updateUserProfile(payload);

      if (data?.user && typeof data.user === "object") {
        patchStoredAuthUser({
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
        });
      }

      let msg =
        typeof data?.message === "string"
          ? data.message
          : "Profil mis à jour.";

      if (data?.user?.isEmailConfirmed === false) {
        msg +=
          " Votre adresse e-mail doit être confirmée à nouveau (mail selon configuration serveur).";
      }

      setMessage(msg);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(
        e?.message ||
          "Impossible de mettre à jour le profil. Vérifiez auth-cart-service et votre connexion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (needsLogin) {
    return (
      <section style={pageStyle}>
        <h1 style={{ marginBottom: "0.35rem" }}>Paramètres du compte</h1>
        <p style={{ marginTop: 0, color: "#555" }}>
          Connectez-vous ou créez un compte pour modifier vos informations.
        </p>
        <GuestAccountPrompt nextPath="/account/settings" />
        <div style={{ marginTop: "1rem" }}>
          <Link href="/account" style={{ color: "#003d5c" }}>
            Retour au compte
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={pageStyle}>
      <h1 style={{ marginBottom: "0.35rem" }}>Paramètres du compte</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Modifications envoyées au serveur (PUT /api/users/profile). Pour changer le mot de passe,
        renseignez l&apos;ancien et le nouveau.
      </p>

      <form onSubmit={handleSubmit} noValidate style={cardStyle}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          Nom complet
          <input
            name="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          E-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>

        <p
          style={{
            marginTop: "1rem",
            marginBottom: "0.25rem",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          Changer le mot de passe (facultatif)
        </p>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          Mot de passe actuel
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          Nouveau mot de passe
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "0.35rem", marginTop: "0.75rem" }}>
          Confirmer le nouveau mot de passe
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error ? (
          <p role="alert" style={{ marginTop: "0.75rem", color: "#b91c1c", marginBottom: 0 }}>
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" style={{ marginTop: "0.75rem", color: "#15803d", marginBottom: 0 }}>
            {message}
          </p>
        ) : null}

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <Link
        href="/account"
        style={{ display: "inline-block", marginTop: "1rem", color: "#003d5c", textDecoration: "none" }}
      >
        Retour au compte
      </Link>
    </section>
  );
}
