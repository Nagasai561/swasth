import { makeHistory } from "./mockData";
import type {
  BackendMeasurement,
  DietPlanResponse,
  HistoryResponse,
  LabValue,
  LanguageCode,
  MealSuggestion,
  ProfilePayload,
  ReportAnalysisResponse,
  ReportFlag,
  ReportPanel,
  UploadFileResponse,
  UserMedicalInfoResponse
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const USER_ID_KEY = "swasth.userId";
const PROFILE_KEY = "swasth.profile";
const LATEST_UPLOAD_KEY = "swasth.latestUpload";

const panels: ReportPanel[] = ["heart_fats", "blood_sugar", "blood_health", "kidneys", "liver", "thyroid", "general"];

const panelMatchers: Array<[ReportPanel, RegExp]> = [
  ["heart_fats", /cholesterol|ldl|hdl|triglyceride|lipid|vldl/i],
  ["blood_sugar", /glucose|sugar|hba1c|a1c|insulin/i],
  ["blood_health", /hemoglobin|haemoglobin|rbc|wbc|platelet|iron|ferritin|b12|folate|cbc/i],
  ["kidneys", /creatinine|urea|uric|egfr|kidney|bun/i],
  ["liver", /bilirubin|sgpt|sgot|alt|ast|alp|liver|albumin|protein/i],
  ["thyroid", /thyroid|tsh|t3|t4/i]
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    let detail = `Request failed with ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body.detail ?? detail;
    } catch {
      // Keep the status fallback when the backend does not return JSON.
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

export async function submitProfile(profile: ProfilePayload, lang: LanguageCode): Promise<{ ok: true; profile: ProfilePayload; userId: number }> {
  void lang;
  const result = await request<UserMedicalInfoResponse>("/user_medical_info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile)
  });

  window.sessionStorage.setItem(USER_ID_KEY, String(result.user_id));
  window.sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return { ok: true, profile, userId: result.user_id };
}

export async function uploadReportFile(file: File, lang: LanguageCode): Promise<ReportAnalysisResponse> {
  const userId = window.sessionStorage.getItem(USER_ID_KEY);
  if (!userId) {
    throw new Error("Please complete your profile before uploading a report.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const upload = await request<UploadFileResponse>(`/upload_file?user_id=${encodeURIComponent(userId)}&lang=${encodeURIComponent(lang)}`, {
    method: "POST",
    body: formData
  });

  window.sessionStorage.setItem(LATEST_UPLOAD_KEY, JSON.stringify(upload));
  return adaptUploadToReport(upload, lang);
}

export async function getReportAnalysis(lang: LanguageCode): Promise<ReportAnalysisResponse | null> {
  const cached = readLatestUpload();
  return cached ? adaptUploadToReport(cached, lang) : null;
}

export async function getDietPlan(lang: LanguageCode): Promise<DietPlanResponse | null> {
  const cached = readLatestUpload();
  return cached ? adaptUploadToDiet(cached, lang) : null;
}

export async function getHistory(lang: LanguageCode): Promise<HistoryResponse> {
  return makeHistory(lang);
}

export function readProfile(): ProfilePayload | null {
  const stored = window.sessionStorage.getItem(PROFILE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as ProfilePayload;
  } catch {
    return null;
  }
}

export function describeError(error: unknown) {
  return getErrorMessage(error);
}

function readLatestUpload(): UploadFileResponse | null {
  const stored = window.sessionStorage.getItem(LATEST_UPLOAD_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as UploadFileResponse;
  } catch {
    return null;
  }
}

const summaryCopy: Record<LanguageCode, { anomalies: (count: number) => string; none: string; diet: (count: number) => string; lifestyle: (count: number) => string; patient: string }> = {
  en: {
    anomalies: (count) => `${count} anomaly${count === 1 ? "" : "ies"} found`,
    none: "No major anomalies listed",
    diet: (count) => `${count} diet suggestion${count === 1 ? "" : "s"}`,
    lifestyle: (count) => `${count} lifestyle step${count === 1 ? "" : "s"}`,
    patient: "Latest upload"
  },
  hi: {
    anomalies: (count) => `${count} असामान्य बात${count === 1 ? "" : "ें"} मिलीं`,
    none: "कोई बड़ी असामान्यता नहीं मिली",
    diet: (count) => `${count} भोजन सुझाव`,
    lifestyle: (count) => `${count} जीवनशैली कदम`,
    patient: "ताजा अपलोड"
  },
  te: {
    anomalies: (count) => `${count} అసాధారణ విషయం${count === 1 ? "" : "లు"} కనిపించాయి`,
    none: "పెద్ద అసాధారణతలు కనిపించలేదు",
    diet: (count) => `${count} ఆహార సూచన${count === 1 ? "" : "లు"}`,
    lifestyle: (count) => `${count} జీవనశైలి దశ${count === 1 ? "" : "లు"}`,
    patient: "తాజా అప్‌లోడ్"
  }
};

function adaptUploadToReport(upload: UploadFileResponse, lang: LanguageCode): ReportAnalysisResponse {
  const copy = summaryCopy[lang] ?? summaryCopy.en;
  const values = upload.measurements.collection.map(adaptMeasurement);
  const analysis = upload.analysis_result;
  const summaryParts = [
    analysis.anomalies.length ? copy.anomalies(analysis.anomalies.length) : copy.none,
    analysis.suggested_diet.length ? copy.diet(analysis.suggested_diet.length) : "",
    analysis.suggested_lifestyle_changes.length ? copy.lifestyle(analysis.suggested_lifestyle_changes.length) : ""
  ].filter(Boolean);

  return {
    report_id: `report-${new Date().toISOString().slice(0, 10)}`,
    patient_name: copy.patient,
    report_date: new Date().toISOString(),
    summary: summaryParts.join(", "),
    analysis,
    groups: panels.map((panel) => ({
      panel,
      values: values.filter((value) => value.panel === panel)
    }))
  };
}

function adaptMeasurement(measurement: BackendMeasurement, index: number): LabValue {
  const panel = panelMatchers.find(([, matcher]) => matcher.test(`${measurement.category} ${measurement.name}`))?.[0] ?? "general";
  const flag = concernToFlag(measurement.concern);
  const range = `${measurement.nominal_range.lower_value}-${measurement.nominal_range.upper_value} ${measurement.unit}`;

  return {
    id: `${measurement.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    test_name: measurement.name,
    value: measurement.observed_value,
    unit: measurement.unit,
    ref_low: measurement.nominal_range.lower_value,
    ref_high: measurement.nominal_range.upper_value,
    flag,
    panel,
    plain_label: measurement.category,
    plain_summary: `${measurement.name} is ${flag === "good" ? "in range" : flag === "watch" ? "worth watching" : "outside the expected range"}.`,
    plain_explanation: `Your result is ${measurement.observed_value} ${measurement.unit}. The usual range shown in the report is ${range}.`
  };
}

function concernToFlag(concern: BackendMeasurement["concern"]): ReportFlag {
  if (concern === "High") {
    return "attention";
  }
  if (concern === "Medium") {
    return "watch";
  }
  return "good";
}

const dietCopy: Record<LanguageCode, { headline: string; fallbackSuggestion: string; fallbackReason: string }> = {
  en: {
    headline: "Diet suggestions from your uploaded report analysis.",
    fallbackSuggestion: "Keep meals balanced with vegetables, protein, whole grains, and steady hydration.",
    fallbackReason: "This follows the backend analysis for your uploaded report."
  },
  hi: {
    headline: "आपकी अपलोड की गई रिपोर्ट के विश्लेषण से भोजन सुझाव।",
    fallbackSuggestion: "सब्जियों, प्रोटीन, साबुत अनाज और पर्याप्त पानी के साथ भोजन संतुलित रखें।",
    fallbackReason: "यह आपकी अपलोड की गई रिपोर्ट के बैकेंड विश्लेषण पर आधारित है।"
  },
  te: {
    headline: "మీ అప్‌లోడ్ చేసిన రిపోర్ట్ విశ్లేషణ ఆధారంగా ఆహార సూచనలు.",
    fallbackSuggestion: "కూరగాయలు, ప్రోటీన్, సంపూర్ణ ధాన్యాలు మరియు సరైన నీటితో భోజనాన్ని సమతుల్యంగా ఉంచండి.",
    fallbackReason: "ఇది మీ అప్‌లోడ్ చేసిన రిపోర్ట్ బ్యాకెండ్ విశ్లేషణ ఆధారంగా ఉంది."
  }
};

function adaptUploadToDiet(upload: UploadFileResponse, lang: LanguageCode): DietPlanResponse {
  const copy = dietCopy[lang] ?? dietCopy.en;
  const suggestions = upload.analysis_result.suggested_diet.length
    ? upload.analysis_result.suggested_diet
    : [copy.fallbackSuggestion];

  const mealOrder: MealSuggestion["meal"][] = ["breakfast", "lunch", "snack", "dinner"];
  const meals = suggestions.map((suggestion, index) => ({
    id: `diet-${index}`,
    meal: mealOrder[index % mealOrder.length],
    title: suggestion,
    description: suggestion,
    reason: upload.analysis_result.anomalies[index % Math.max(upload.analysis_result.anomalies.length, 1)] ?? copy.fallbackReason,
    linked_value_id: upload.measurements.collection[index % Math.max(upload.measurements.collection.length, 1)]?.name ?? "analysis"
  }));

  return {
    report_id: `report-${new Date().toISOString().slice(0, 10)}`,
    headline: copy.headline,
    meals
  };
}
