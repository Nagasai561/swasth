import type { ProfilePayload } from "./types";

export type SampleProfileId = "user-1" | "user-2";

export interface SampleReport {
  fileName: string;
  assetPath: string;
  mimeType: string;
}

export interface SampleProfile {
  id: SampleProfileId;
  label: string;
  description: string;
  report: SampleReport;
  profile: ProfilePayload;
}

export const SAMPLE_PROFILE_KEY = "swasth.sampleProfileId";

export const sampleProfileOptions: Array<{ id: SampleProfileId; label: string; description: string; path: string }> = [
  {
    id: "user-1",
    label: "User 1",
    description: "Image report sample",
    path: "/assets/samples/user-1-profile.json"
  },
  {
    id: "user-2",
    label: "User 2",
    description: "PDF report sample",
    path: "/assets/samples/user-2-profile.json"
  }
];

const cache = new Map<SampleProfileId, SampleProfile>();

export function resolveSampleAssetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

export async function loadSampleProfile(id: SampleProfileId): Promise<SampleProfile> {
  const cached = cache.get(id);
  if (cached) {
    return cached;
  }

  const option = sampleProfileOptions.find((sample) => sample.id === id);
  if (!option) {
    throw new Error("Sample profile not found.");
  }

  const response = await fetch(resolveSampleAssetUrl(option.path));
  if (!response.ok) {
    throw new Error("Unable to load this sample profile.");
  }

  const sample = (await response.json()) as SampleProfile;
  cache.set(id, sample);
  return sample;
}

export async function loadSelectedSampleProfile(): Promise<SampleProfile | null> {
  const id = readSelectedSampleProfileId();
  return id ? loadSampleProfile(id) : null;
}

export function readSelectedSampleProfileId(): SampleProfileId | null {
  const id = window.sessionStorage.getItem(SAMPLE_PROFILE_KEY);
  return id === "user-1" || id === "user-2" ? id : null;
}

export function writeSelectedSampleProfileId(id: SampleProfileId | null) {
  if (id) {
    window.sessionStorage.setItem(SAMPLE_PROFILE_KEY, id);
    return;
  }

  window.sessionStorage.removeItem(SAMPLE_PROFILE_KEY);
}

export async function sampleReportToFile(report: SampleReport): Promise<File> {
  const response = await fetch(resolveSampleAssetUrl(report.assetPath));
  if (!response.ok) {
    throw new Error("Unable to load this sample report.");
  }

  const blob = await response.blob();
  return new File([blob], report.fileName, { type: report.mimeType });
}
