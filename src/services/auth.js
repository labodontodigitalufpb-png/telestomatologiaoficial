import { API_BASE_URL, setToken, removeToken, getToken } from "./api";

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
  } catch (error) {
    throw new Error("Não foi possível conectar ao backend. Verifique se a API está ligada.");
  }

  if (!response.ok) {
    let errorMessage = "Falha no login";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (data?.access_token) {
    setToken(data.access_token);
  }

  return data;
}

export async function register(userData) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  } catch (error) {
    throw new Error("Não foi possível conectar ao backend. Verifique se a API está ligada.");
  }

  if (!response.ok) {
    let errorMessage = "Falha no cadastro";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export function logout() {
  removeToken();
}

export function isAuthenticated() {
  return !!getToken();
}

export function getAuthToken() {
  return getToken();
}