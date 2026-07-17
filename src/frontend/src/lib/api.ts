import { makeDietPlan, makeHistory, makeReportAnalysis } from "./mockData";
import type { DietPlanResponse, HistoryResponse, LanguageCode, ProfilePayload, ReportAnalysisResponse } from "./types";

const wait = (ms = 650) => new Promise((resolve) => window.setTimeout(resolve, ms));

// TODO: BACKEND replace this mock with a POST /profile call.
export async function submitProfile(profile: ProfilePayload, lang: LanguageCode): Promise<{ ok: true; profile: ProfilePayload }> {
  void lang;
  await wait(450);
  return { ok: true, profile };
}

// TODO: BACKEND replace this mock with a POST /reports/analyze call.
export async function getReportAnalysis(lang: LanguageCode, file?: File): Promise<ReportAnalysisResponse> {
  void file;
  await wait();
  return makeReportAnalysis(lang);
}

// TODO: BACKEND replace this mock with a GET /reports/{id}/diet-plan call.
export async function getDietPlan(lang: LanguageCode, reportId = "report-2026-07-17"): Promise<DietPlanResponse> {
  void reportId;
  await wait();
  return makeDietPlan(lang);
}

// TODO: BACKEND replace this mock with a GET /history call.
export async function getHistory(lang: LanguageCode): Promise<HistoryResponse> {
  await wait();
  return makeHistory(lang);
}
