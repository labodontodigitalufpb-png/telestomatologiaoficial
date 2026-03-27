import { apiFetch } from "./api";

export async function getDashboardSummary() {
  return apiFetch("/dashboard/summary");
}

export async function getCasesByState() {
  return apiFetch("/dashboard/cases-by-state");
}

export async function getSuspectedByState() {
  return apiFetch("/dashboard/suspected-by-state");
}

export async function getFollowupByState() {
  return apiFetch("/dashboard/followup-by-state");
}

export async function getResponseTime() {
  return apiFetch("/dashboard/response-time");
}