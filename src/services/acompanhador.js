import { apiFetch } from "./api";

export async function listMunicipalCases() {
  return apiFetch("/acompanhador/cases");
}
