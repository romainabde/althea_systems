import { login, register } from "./api/authApi";

export async function loginUser(payload) {
  return login(payload);
}

export async function registerUser(payload) {
  return register(payload);
}
