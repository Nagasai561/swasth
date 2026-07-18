export type LanguageCode = "en" | "hi" | "te";

export type Sex = "Male" | "Female";
export type SmokingStatus = "Never" | "Former Smoker" | "Occasionally" | "Daily";
export type AlcoholStatus = "Never" | "Occasionally" | "Weekly" | "Daily";
export type ExerciseStatus = "None" | "1-2 days/week" | "3-5 days/week" | "6-7 days/week";
export type BackendDiet = "Vegetarian" | "Vegan" | "Mixed";
export type SleepStatus = "<5 hours" | "5-6 hours" | "7-8 hours" | "8+ hours";

export type ReportFlag = "good" | "watch" | "attention";
export type ReportPanel = "heart_fats" | "blood_sugar" | "blood_health" | "kidneys" | "liver" | "thyroid" | "general";

export interface LifestylePayload {
  smoking: SmokingStatus;
  alcohol: AlcoholStatus;
  exercise: ExerciseStatus;
  diet: BackendDiet;
  sleep: SleepStatus;
}

export interface ProfilePayload {
  age: number;
  weight: number;
  height: number;
  sex: Sex;
  pregnant: boolean;
  existing_conditions: string[];
  current_medications: string[];
  lifestyle: LifestylePayload;
  family_history: string[];
  symptoms: string[];
}

export interface UserMedicalInfoResponse {
  user_id: number;
}

export interface AnalysisResult {
  anomalies: string[];
  possible_causes: string[];
  suggested_diet: string[];
  suggested_lifestyle_changes: string[];
}

export interface BackendMeasurement {
  category: string;
  name: string;
  observed_value: number;
  nominal_range: {
    lower_value: number;
    upper_value: number;
  };
  unit: string;
  concern: "Low" | "Medium" | "High";
}

export interface UploadFileResponse {
  analysis_result: AnalysisResult;
  measurements: {
    collection: BackendMeasurement[];
  };
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
  analysis: AnalysisResult;
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
