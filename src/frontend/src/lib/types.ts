export type LanguageCode = "en" | "hi" | "te";

export type Gender = "female" | "male" | "non_binary" | "prefer_not";
export type DietPreference = "veg" | "non_veg" | "egg";
export type ActivityLevel = "low" | "moderate" | "high";
export type HealthGoal = "energy" | "weight" | "sugar" | "heart";

export type ReportFlag = "good" | "watch" | "attention";
export type ReportPanel = "heart_fats" | "blood_sugar" | "blood_health" | "kidneys" | "liver" | "thyroid";

export interface ProfilePayload {
  age: number;
  gender: Gender;
  dietPreference: DietPreference;
  activityLevel: ActivityLevel;
  goal: HealthGoal;
}

export interface LocalizedText {
  en: string;
  hi: string;
  te: string;
}

export interface LabValue {
  id: string;
  test_name: string;
  value: number;
  unit: string;
  ref_low: number;
  ref_high: number;
  flag: ReportFlag;
  panel: ReportPanel;
  plain_label: string;
  plain_summary: string;
  plain_explanation: string;
}

export interface ReportGroup {
  panel: ReportPanel;
  values: LabValue[];
}

export interface ReportAnalysisResponse {
  report_id: string;
  patient_name: string;
  report_date: string;
  summary: string;
  groups: ReportGroup[];
}

export interface MealSuggestion {
  id: string;
  meal: "breakfast" | "lunch" | "snack" | "dinner";
  title: string;
  description: string;
  reason: string;
  linked_value_id: string;
}

export interface DietPlanResponse {
  report_id: string;
  headline: string;
  meals: MealSuggestion[];
}

export interface HistoryReport {
  id: string;
  date: string;
  title: string;
  highlights: string[];
}

export interface TrendPoint {
  date: string;
  value: number;
  ref_low: number;
  ref_high: number;
  unit: string;
}

export interface HistoryResponse {
  reports: HistoryReport[];
  trends: Record<string, TrendPoint[]>;
}
