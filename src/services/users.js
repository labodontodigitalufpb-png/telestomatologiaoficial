import { apiFetch } from "./api";

export async function registerUser(payload) {
  return apiFetch("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}