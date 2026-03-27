import { apiFetch, API_BASE_URL, getToken } from "./api";

export async function listMessages(caseId) {
  return apiFetch(`/chat/cases/${caseId}/messages`);
}

export async function sendTextMessage(caseId, content) {
  return apiFetch(`/chat/cases/${caseId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content,
      message_type: "TEXT",
    }),
  });
}

export async function uploadChatFile(caseId, messageType, file, content = "") {
  const token = getToken();
  const formData = new FormData();
  formData.append("message_type", messageType);
  formData.append("file", file);
  formData.append("content", content);

  const response = await fetch(`${API_BASE_URL}/chat/cases/${caseId}/messages/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Erro ao enviar arquivo no chat";
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