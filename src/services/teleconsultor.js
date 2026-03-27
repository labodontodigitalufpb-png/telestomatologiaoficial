import { apiFetch } from "./api";

export async function listTeleconsultorCases() {
  return apiFetch("/teleconsultor/my-cases");
}

export async function respondCase(caseId, payload) {
  return apiFetch(`/teleconsultor/cases/${caseId}/response`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTeleconsultResponse(responseId, payload) {
  return apiFetch(`/teleconsultor/responses/${responseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getTeleconsultResponse(caseId) {
  return apiFetch(`/teleconsultor/cases/${caseId}/response`);
}