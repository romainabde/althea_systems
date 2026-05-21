"use client";

import { useEffect, useState } from "react";

import {
  AccountAlert,
  AccountPageShell,
  accountCardStyle,
  accountInputStyle,
  accountLabelStyle,
  accountPrimaryBtn,
  accountSectionTitleStyle,
} from "../../../components/account/accountStyles";
import GuestAccountPrompt from "../../../components/account/GuestAccountPrompt";
import { updateUserProfile } from "../../../services/api/userApi";
import { getAuthToken, getAuthUser, patchStoredAuthUser } from "../../../services/authSession";

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
        setError("L'ancien mot de passe est obligatoire pour en définir un nouveau.");
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
          ...(typeof data.user.role === "string" ? { role: data.user.role } : {}),
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
          "Impossible de mettre à jour le profil. Vérifiez votre connexion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (needsLogin) {
    return (
      <AccountPageShell
        title="Paramètres"
        subtitle="Modifiez vos informations personnelles et votre mot de passe."
        icon="⚙️"
        accent="#475569"
      >
        <div style={{ ...accountCardStyle, padding: "32px" }}>
          <GuestAccountPrompt nextPath="/account/settings" />
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell
      title="Paramètres"
      subtitle="Gérez votre profil et la sécurité de votre compte."
      icon="⚙️"
      accent="#475569"
    >
      {message ? <AccountAlert type="success">{message}</AccountAlert> : null}
      {error ? <AccountAlert type="error">{error}</AccountAlert> : null}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ ...accountCardStyle, marginBottom: "20px" }}>
          <h2 style={accountSectionTitleStyle}>Informations personnelles</h2>
          <p style={{ margin: "0 0 18px 0", color: "#64748b", fontSize: "0.92rem" }}>
            Mettez à jour votre nom et votre adresse e-mail.
          </p>

          <div style={{ display: "grid", gap: "16px" }}>
            <label style={accountLabelStyle}>
              Nom complet
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={accountInputStyle}
              />
            </label>

            <label style={accountLabelStyle}>
              E-mail
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={accountInputStyle}
              />
            </label>
          </div>
        </div>

        <div style={accountCardStyle}>
          <h2 style={accountSectionTitleStyle}>Mot de passe</h2>
          <p style={{ margin: "0 0 18px 0", color: "#64748b", fontSize: "0.92rem" }}>
            Laissez vide si vous ne souhaitez pas le modifier.
          </p>

          <div style={{ display: "grid", gap: "16px" }}>
            <label style={accountLabelStyle}>
              Mot de passe actuel
              <input
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={accountInputStyle}
              />
            </label>
            <label style={accountLabelStyle}>
              Nouveau mot de passe
              <input
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={accountInputStyle}
              />
            </label>
            <label style={accountLabelStyle}>
              Confirmer le nouveau mot de passe
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={accountInputStyle}
              />
            </label>
          </div>

          <p style={{ margin: "14px 0 0 0", fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>
            Minimum 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial.
          </p>

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...accountPrimaryBtn,
              width: "100%",
              marginTop: "24px",
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </AccountPageShell>
  );
}
