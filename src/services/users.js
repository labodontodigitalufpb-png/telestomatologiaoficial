import { apiDelete, apiFetch, apiGet, apiPatch } from "./api";

export async function registerUser(payload) {
  return apiFetch("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listUsers() {
  return apiGet("/users/");
}

export async function updateUserStatus(userId, isActive) {
  return apiPatch(`/users/${userId}/status`, {
    is_active: isActive,
  });
}

export async function deleteUser(userId) {
  return apiDelete(`/users/${userId}`);
}
