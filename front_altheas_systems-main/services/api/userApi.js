import { httpClient } from "./http/client";
import { API_ROUTES } from "../routes";

/**
 * Met à jour le profil (auth-cart-service PUT /api/users/profile).
 * Au moins un champ doit être différent côté serveur ; pour un nouveau MDP :
 * `currentPassword` + `newPassword` obligatoires.
 *
 * @param {{
 *   fullName?: string;
 *   email?: string;
 *   currentPassword?: string;
 *   newPassword?: string;
 * }} payload
 */
export async function updateUserProfile(payload) {
  const body = {};

  if (payload.fullName != null && String(payload.fullName).trim() !== "") {
    body.fullName = String(payload.fullName).trim();
  }
  if (payload.email != null && String(payload.email).trim() !== "") {
    body.email = String(payload.email).trim().toLowerCase();
  }
  if (payload.newPassword != null && String(payload.newPassword) !== "") {
    body.newPassword = String(payload.newPassword);
    body.currentPassword = String(payload.currentPassword || "");
  }

  return httpClient(API_ROUTES.users.updateProfile, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
