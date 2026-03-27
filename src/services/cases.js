import { apiFetch, API_BASE_URL, getToken } from "./api";

export async function createCase(payload) {
  return apiFetch("/cases/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listMyCases() {
  return apiFetch("/cases/mine");
}

export async function submitCase(caseId) {
  return apiFetch(`/cases/${caseId}/submit`, {
    method: "POST",
  });
}

export async function getCaseDetail(caseId) {
  return apiFetch(`/cases/${caseId}/detail`);
}

export async function uploadCaseMedia(caseId, mediaType, file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("media_type", mediaType);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Erro ao enviar arquivo";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}