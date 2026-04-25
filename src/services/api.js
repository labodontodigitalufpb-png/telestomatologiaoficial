export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("teleestomato_token");
}

export function setToken(token) {
  localStorage.setItem("teleestomato_token", token);
}

export function removeToken() {
  localStorage.removeItem("teleestomato_token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error("Não foi possível conectar ao backend. Verifique se a API está ligada.");
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { detail: text } : null;
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.detail ||
      data?.message ||
      `Erro ${response.status}: ${response.statusText}`;

    throw new Error(errorMessage);
  }

  return data;
}

export async function apiGet(path) {
  return await apiFetch(path, {
    method: "GET",
  });
}

export async function apiPost(path, body = {}) {
  return await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut(path, body = {}) {
  return await apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiPatch(path, body = {}) {
  return await apiFetch(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path) {
  return await apiFetch(path, {
    method: "DELETE",
  });
}

export async function apiPostForm(path, formData) {
  return await apiFetch(path, {
    method: "POST",
    body: formData,
  });
}
