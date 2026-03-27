import { apiFetch } from "./api";

export async function listRegulatorCases() {
  return apiFetch("/telerregulador/cases");
}

export async function createFollowup(caseId, payload) {
  return apiFetch(`/telerregulador/cases/${caseId}/followup`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listFollowups(caseId) {
  return apiFetch(`/telerregulador/cases/${caseId}/followups`);
}

export async function updateFollowup(followupId, payload) {
  return apiFetch(`/telerregulador/followups/${followupId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}