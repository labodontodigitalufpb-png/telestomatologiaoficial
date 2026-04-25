import { apiFetch, API_BASE_URL, getToken } from "./api";

export async function listPathologistCases() {
  return apiFetch("/patologista/cases");
}

export async function getPathologistCaseDetail(caseId) {
  return apiFetch(`/patologista/cases/${caseId}/detail`);
}

export async function upsertPathologyReport(caseId, diagnosis, reportFile, malignantNeoplasm = false) {
  const token = getToken();
  const formData = new FormData();
  formData.append("diagnosis", diagnosis);
  formData.append("malignant_neoplasm", String(malignantNeoplasm));
  if (reportFile) formData.append("report_file", reportFile);

  const response = await fetch(`${API_BASE_URL}/patologista/cases/${caseId}/report`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Erro ao salvar laudo";
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
