import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, FileText, Loader2, Minus, Pencil, Plus, X } from "lucide-react";
import { readProfile, readUserId, submitProfile } from "../lib/api";
import { loadSampleProfile, readSelectedSampleProfileId, sampleProfileOptions, writeSelectedSampleProfileId } from "../lib/sampleProfiles";
import type { SampleProfileId } from "../lib/sampleProfiles";
import type { AlcoholStatus, BackendDiet, ExerciseStatus, ProfilePayload, Sex, SleepStatus, SmokingStatus } from "../lib/types";
import { useLanguage } from "../hooks/useLanguage";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";

type StepKey = "basics" | "lifestyle" | "conditions" | "medications" | "family" | "symptoms";

const steps: StepKey[] = ["basics", "lifestyle", "conditions", "medications", "family", "symptoms"];

const existingConditionOptions = [
  "None",
  "Diabetes (Type 1)",
  "Diabetes (Type 2)",
  "Prediabetes",
  "Hypertension (High blood pressure)",
  "High cholesterol",
  "Heart disease",
  "Kidney disease",
  "Liver disease",
  "Thyroid disorder",
  "Anemia",
  "Iron deficiency",
  "Vitamin B12 deficiency",
  "Vitamin D deficiency",
  "Asthma",
  "PCOS",
  "Obesity",
  "Depression",
  "Anxiety"
];

const medicationOptions = [
  "None",
  "Diabetes medication",
  "Blood pressure medication",
  "Cholesterol medication",
  "Thyroid medication",
  "Blood thinner",
  "Steroid medication",
  "Antibiotics",
  "Hormonal medication (birth control/HRT)",
  "Iron supplement",
  "Vitamin supplements (B12, D, folic acid, multivitamin)",
  "Protein/Creatine supplement"
];

const familyHistoryOptions = [
  "None",
  "Diabetes",
  "Hypertension",
  "High cholesterol",
  "Heart disease",
  "Stroke",
  "Kidney disease",
  "Liver disease",
  "Thyroid disease",
  "Anemia",
  "Blood disorders",
  "Cancer",
  "Obesity",
  "Genetic disorder"
];

const symptomOptions = [
  "None",
  "Fatigue or weakness",
  "Fever",
  "Weight loss",
  "Weight gain",
  "Dizziness or fainting",
  "Headache",
  "Chest pain",
  "Shortness of breath",
  "Frequent infections",
  "Excessive thirst or urination",
  "Abdominal pain",
  "Nausea or vomiting",
  "Diarrhea or constipation",
  "Joint or muscle pain",
  "Hair loss",
  "Skin rash or itching",
  "Easy bruising or bleeding",
  "Swollen legs"
];

const defaultProfile: ProfilePayload = {
  age: 35,
  weight: 70,
  height: 170,
  sex: "Female",
  pregnant: false,
  existing_conditions: ["None"],
  current_medications: ["None"],
  lifestyle: {
    smoking: "Never",
    alcohol: "Occasionally",
    exercise: "3-5 days/week",
    diet: "Mixed",
    sleep: "7-8 hours"
  },
  family_history: ["None"],
  symptoms: ["None"]
};

export function OnboardingPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(() => Boolean(readUserId() && readProfile()));
  const [isEditing, setIsEditing] = useState(() => !readUserId());
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfilePayload>(() => readProfile() ?? defaultProfile);
  const [selectedSampleId, setSelectedSampleId] = useState<SampleProfileId | "">(() => readSelectedSampleProfileId() ?? "");
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const saveAndContinue = async () => {
    setError("");
    if (hasSavedProfile && !isEditing) {
      setIsEditing(true);
      return;
    }

    if (!hasSavedProfile && stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    try {
      setIsSaving(true);
      await submitProfile(normalizeProfile(profile), language);
      setIsSaved(true);
      setHasSavedProfile(true);
      setIsEditing(false);
      if (!hasSavedProfile) {
        navigate("/upload");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const applySampleProfile = async (sampleId: SampleProfileId | "") => {
    setSelectedSampleId(sampleId);
    setError("");

    if (!sampleId) {
      writeSelectedSampleProfileId(null);
      return;
    }

    try {
      setIsLoadingSample(true);
      const sample = await loadSampleProfile(sampleId);
      setProfile(sample.profile);
      setStepIndex(0);
      setIsEditing(true);
      setIsSaved(false);
      writeSelectedSampleProfileId(sample.id);
    } catch (sampleError) {
      writeSelectedSampleProfileId(null);
      setSelectedSampleId("");
      setError(sampleError instanceof Error ? sampleError.message : "Unable to load this sample profile.");
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-turmeric">{t("onboarding.progress", { current: stepIndex + 1, total: steps.length })}</p>
            {hasSavedProfile ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isEditing || isSaving}
                className="inline-flex min-h-9 items-center gap-2 rounded-soft border border-line bg-white px-3 text-sm font-semibold text-pine transition hover:bg-pine/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Pencil className="size-4" aria-hidden="true" />
                {t("common.editProfile")}
              </button>
            ) : null}
          </div>
          <h1 className="break-words font-serif text-3xl font-bold tracking-normal text-pine sm:text-4xl md:text-5xl">{t("onboarding.title")}</h1>
          <p className="max-w-2xl text-base leading-7 text-warmgray sm:text-lg sm:leading-8">A fuller profile helps the backend interpret your report with your lifestyle, symptoms, medications, and family history in mind.</p>
          <Progress value={progress} />
          <div className="rounded-soft border border-turmeric/30 bg-turmeric/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-soft bg-white text-pine">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase text-turmeric">Test samples</p>
                  <p className="mt-1 text-sm leading-6 text-charcoal">Pick User 1 or User 2 to fill this profile and use the linked sample report on the next step.</p>
                </div>
              </div>
              <label className="relative w-full sm:w-64">
                <span className="sr-only">Choose a test sample</span>
                <select
                  value={selectedSampleId}
                  disabled={isLoadingSample || isSaving}
                  onChange={(event) => void applySampleProfile(event.target.value as SampleProfileId | "")}
                  className="min-h-11 w-full appearance-none rounded-soft border border-line bg-white py-2 pl-3 pr-10 font-semibold text-charcoal disabled:text-warmgray"
                >
                  <option value="">Choose sample</option>
                  {sampleProfileOptions.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      {sample.label} - {sample.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-pine" aria-hidden="true" />
              </label>
            </div>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2 self-end sm:grid-cols-3 xl:grid-cols-2">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step}
              onClick={() => setStepIndex(index)}
              className={cn(
                "min-h-11 min-w-0 rounded-soft border px-2 py-2 text-sm font-semibold leading-5 transition sm:px-3",
                index === stepIndex ? "border-pine bg-pine text-white" : "border-line bg-white text-warmgray hover:border-pine"
              )}
            >
              {stepLabel(step)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold uppercase text-turmeric">{stepLabel(currentStep)}</p>
          <h2 className="break-words font-serif text-2xl font-semibold text-charcoal sm:text-3xl">{stepTitle(currentStep)}</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === "basics" ? <BasicsStep profile={profile} setProfile={setProfile} disabled={!isEditing} /> : null}
          {currentStep === "lifestyle" ? <LifestyleStep profile={profile} setProfile={setProfile} disabled={!isEditing} /> : null}
          {currentStep === "conditions" ? (
            <MultiSelectStep
              label="Existing conditions"
              helper="Choose all that apply. Add your own if it is not listed."
              options={existingConditionOptions}
              values={profile.existing_conditions}
              onChange={(existing_conditions) => setProfile((current) => ({ ...current, existing_conditions }))}
              disabled={!isEditing}
            />
          ) : null}
          {currentStep === "medications" ? (
            <MultiSelectStep
              label="Current medications"
              helper="Supplements count too, because they can affect lab values."
              options={medicationOptions}
              values={profile.current_medications}
              onChange={(current_medications) => setProfile((current) => ({ ...current, current_medications }))}
              disabled={!isEditing}
            />
          ) : null}
          {currentStep === "family" ? (
            <MultiSelectStep
              label="Family history"
              helper="These help the analysis understand inherited risk patterns."
              options={familyHistoryOptions}
              values={profile.family_history}
              onChange={(family_history) => setProfile((current) => ({ ...current, family_history }))}
              disabled={!isEditing}
            />
          ) : null}
          {currentStep === "symptoms" ? (
            <MultiSelectStep
              label="Current symptoms"
              helper="Pick anything you have noticed recently."
              options={symptomOptions}
              values={profile.symptoms}
              onChange={(symptoms) => setProfile((current) => ({ ...current, symptoms }))}
              disabled={!isEditing}
            />
          ) : null}

          {error ? <div className="rounded-soft border border-brick/30 bg-brick/5 px-4 py-3 text-sm font-semibold text-brick">{error}</div> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="secondary" disabled={stepIndex === 0 || isSaving} onClick={() => setStepIndex((current) => Math.max(0, current - 1))} className="w-full sm:w-auto">
              {t("common.back")}
            </Button>
            <Button type="button" onClick={saveAndContinue} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : isSaved ? <Check className="size-4" aria-hidden="true" /> : null}
              {hasSavedProfile && !isEditing ? t("common.editProfile") : hasSavedProfile ? t("common.save") : stepIndex === steps.length - 1 ? t("common.save") : t("common.continue")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BasicsStep({ profile, setProfile, disabled }: { profile: ProfilePayload; setProfile: React.Dispatch<React.SetStateAction<ProfilePayload>>; disabled?: boolean }) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NumberField label="Age" min={1} max={110} value={profile.age} onChange={(age) => setProfile((current) => ({ ...current, age }))} suffix="years" disabled={disabled} />
      <NumberField label="Weight" max={220} value={profile.weight} onChange={(weight) => setProfile((current) => ({ ...current, weight }))} suffix="kg" disabled={disabled} />
      <NumberField label="Height" max={230} value={profile.height} onChange={(height) => setProfile((current) => ({ ...current, height }))} suffix="cm" disabled={disabled} />
      <div className="sm:col-span-2">
        <SegmentedControl<Sex> label="Sex" values={["Female", "Male"]} selected={profile.sex} onSelect={(sex) => setProfile((current) => ({ ...current, sex, pregnant: sex === "Female" ? current.pregnant : false }))} disabled={disabled} />
      </div>
      <label className={cn("flex min-h-[74px] min-w-0 items-center justify-between gap-4 rounded-soft border border-line bg-paper px-4 py-3 sm:col-span-2 lg:col-span-1", profile.sex !== "Female" && "opacity-55")}>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-charcoal">Currently pregnant</span>
          <span className="text-sm text-warmgray">Used only when applicable for interpretation.</span>
        </span>
        <input
          type="checkbox"
          checked={profile.pregnant}
          disabled={disabled || profile.sex !== "Female"}
          onChange={(event) => setProfile((current) => ({ ...current, pregnant: event.target.checked }))}
          className="size-5 accent-pine"
        />
      </label>
    </div>
  );
}

function LifestyleStep({ profile, setProfile, disabled }: { profile: ProfilePayload; setProfile: React.Dispatch<React.SetStateAction<ProfilePayload>>; disabled?: boolean }) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <SelectField<SmokingStatus> label="Smoking" value={profile.lifestyle.smoking} options={["Never", "Former Smoker", "Occasionally", "Daily"]} onChange={(smoking) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, smoking } }))} disabled={disabled} />
      <SelectField<AlcoholStatus> label="Alcohol" value={profile.lifestyle.alcohol} options={["Never", "Occasionally", "Weekly", "Daily"]} onChange={(alcohol) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, alcohol } }))} disabled={disabled} />
      <SelectField<ExerciseStatus> label="Exercise" value={profile.lifestyle.exercise} options={["None", "1-2 days/week", "3-5 days/week", "6-7 days/week"]} onChange={(exercise) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, exercise } }))} disabled={disabled} />
      <SelectField<BackendDiet> label="Diet pattern" value={profile.lifestyle.diet} options={["Vegetarian", "Vegan", "Mixed"]} onChange={(diet) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, diet } }))} disabled={disabled} />
      <div className="sm:col-span-2">
        <SegmentedControl<SleepStatus> label="Sleep" values={["<5 hours", "5-6 hours", "7-8 hours", "8+ hours"]} selected={profile.lifestyle.sleep} onSelect={(sleep) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, sleep } }))} disabled={disabled} />
      </div>
    </div>
  );
}

function NumberField({ label, min, max, value, suffix, onChange, disabled }: { label: string; min?: number; max: number; value: number; suffix: string; onChange: (value: number) => void; disabled?: boolean }) {
  const [draftValue, setDraftValue] = useState(String(value));
  const clamp = (nextValue: number) => Math.min(max, min === undefined ? nextValue : Math.max(min, nextValue));
  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraftValue = event.target.value;
    setDraftValue(nextDraftValue);
  };
  const commit = () => {
    const nextValue = Number(draftValue);
    const nextClampedValue = draftValue !== "" && Number.isFinite(nextValue) ? clamp(nextValue) : value;
    setDraftValue(String(nextClampedValue));
    onChange(nextClampedValue);
  };
  const nudge = (amount: number) => {
    const parsedDraftValue = Number(draftValue);
    const baseValue = draftValue !== "" && Number.isFinite(parsedDraftValue) ? parsedDraftValue : value;
    const nextValue = clamp(baseValue + amount);
    setDraftValue(String(nextValue));
    onChange(nextValue);
  };

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  return (
    <div className="min-w-0 rounded-soft border border-line bg-paper p-3 sm:p-4">
      <label htmlFor={`profile-${label.toLowerCase()}`} className="text-sm font-semibold text-warmgray">
        {label}
      </label>
      <div className="mt-2 flex min-h-14 min-w-0 items-center overflow-hidden rounded-soft border border-line bg-white">
        <button type="button" onClick={() => nudge(-1)} disabled={disabled || (min !== undefined && value <= min)} className="grid h-14 w-11 shrink-0 place-items-center border-r border-line text-pine transition hover:bg-pine/5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-12">
          <Minus className="size-4" aria-hidden="true" />
          <span className="sr-only">Decrease {label}</span>
        </button>
        <div className="flex min-w-0 flex-1 items-baseline px-2 sm:px-3">
          <input
            id={`profile-${label.toLowerCase()}`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={draftValue}
            onChange={update}
            onBlur={commit}
            disabled={disabled}
            className="min-w-0 flex-1 bg-transparent text-center text-2xl font-bold text-pine outline-none disabled:text-warmgray sm:text-3xl"
          />
          <span className="ml-1 shrink-0 text-xs font-semibold text-warmgray sm:ml-2 sm:text-sm">{suffix}</span>
        </div>
        <button type="button" onClick={() => nudge(1)} disabled={disabled || value >= max} className="grid h-14 w-11 shrink-0 place-items-center border-l border-line text-pine transition hover:bg-pine/5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-12">
          <Plus className="size-4" aria-hidden="true" />
          <span className="sr-only">Increase {label}</span>
        </button>
      </div>
    </div>
  );
}

function SelectField<T extends string>({ label, value, options, onChange, disabled }: { label: string; value: T; options: T[]; onChange: (value: T) => void; disabled?: boolean }) {
  return (
    <label className="block min-w-0 rounded-soft border border-line bg-paper p-3 sm:p-4">
      <span className="text-sm font-semibold text-warmgray">{label}</span>
      <span className="relative mt-2 block">
        <select value={value} onChange={(event) => onChange(event.target.value as T)} disabled={disabled} className="w-full appearance-none rounded-soft border border-line bg-white py-3 pl-3 pr-10 font-semibold text-charcoal disabled:text-warmgray">
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-pine" aria-hidden="true" />
      </span>
    </label>
  );
}

function SegmentedControl<T extends string>({ label, values, selected, onSelect, disabled }: { label: string; values: T[]; selected: T; onSelect: (value: T) => void; disabled?: boolean }) {
  return (
    <div className="min-w-0 rounded-soft border border-line bg-paper p-3 sm:p-4">
      <p className="text-sm font-semibold text-warmgray">{label}</p>
      <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => onSelect(value)}
            disabled={disabled}
            className={cn("min-h-11 min-w-0 rounded-soft border px-3 py-2 text-sm font-semibold leading-5 transition", selected === value ? "border-pine bg-pine text-white" : "border-line bg-white text-charcoal hover:border-pine")}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectStep({ label, helper, options, values, onChange, disabled }: { label: string; helper: string; options: string[]; values: string[]; onChange: (values: string[]) => void; disabled?: boolean }) {
  const [customValue, setCustomValue] = useState("");
  const customValues = values.filter((value) => !options.includes(value));
  const normalizedCustomValue = customValue.trim().toLowerCase();
  const hasDuplicateValue = Boolean(normalizedCustomValue) && [...options, ...values].some((value) => value.toLowerCase() === normalizedCustomValue);

  const toggle = (option: string) => {
    if (disabled) {
      return;
    }

    if (option === "None") {
      onChange(["None"]);
      return;
    }

    const withoutNone = values.filter((value) => value !== "None");
    onChange(withoutNone.includes(option) ? withoutNone.filter((value) => value !== option) : [...withoutNone, option]);
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed || disabled) {
      return;
    }
    if ([...options, ...values].some((value) => value.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const nextValues = values.filter((value) => value !== "None");
    onChange(nextValues.includes(trimmed) ? nextValues : [...nextValues, trimmed]);
    setCustomValue("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-charcoal">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-warmgray">{helper}</p>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            disabled={disabled}
            className={cn("min-h-12 min-w-0 rounded-soft border px-4 py-3 text-left text-sm font-semibold leading-5 transition", values.includes(option) ? "border-pine bg-pine text-white" : "border-line bg-paper text-charcoal hover:border-pine")}
          >
            {option}
          </button>
        ))}
      </div>
      {customValues.length ? (
        <div className="flex flex-wrap gap-2">
          {customValues.map((value) => (
            <button
              type="button"
              key={value}
              disabled={disabled}
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="group inline-flex min-w-0 items-center gap-2 rounded-soft border border-pine/20 bg-pine/10 px-3 py-2 text-sm font-semibold text-pine transition hover:bg-pine/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="min-w-0 break-words">{value}</span>
              <X className="size-3.5 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
              <span className="sr-only">Remove {value}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col gap-3 rounded-soft border border-line bg-paper p-3 sm:flex-row">
        <input
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          disabled={disabled}
          placeholder="Add another option"
          aria-invalid={hasDuplicateValue}
          className="min-h-11 min-w-0 flex-1 rounded-soft border border-line bg-white px-3 text-charcoal disabled:text-warmgray aria-[invalid=true]:border-brick"
        />
        <Button type="button" variant="secondary" onClick={addCustom} disabled={disabled || !customValue.trim() || hasDuplicateValue} className="w-full sm:w-auto">
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}

function normalizeProfile(profile: ProfilePayload): ProfilePayload {
  const normalizeList = (values: string[]) => (values.length ? values : ["None"]);
  return {
    ...profile,
    existing_conditions: normalizeList(profile.existing_conditions),
    current_medications: normalizeList(profile.current_medications),
    family_history: normalizeList(profile.family_history),
    symptoms: normalizeList(profile.symptoms)
  };
}

function stepLabel(step: StepKey) {
  return {
    basics: "Basics",
    lifestyle: "Lifestyle",
    conditions: "Conditions",
    medications: "Meds",
    family: "Family",
    symptoms: "Symptoms"
  }[step];
}

function stepTitle(step: StepKey) {
  return {
    basics: "Tell us the essentials",
    lifestyle: "Daily habits and diet",
    conditions: "Existing health conditions",
    medications: "Medicines and supplements",
    family: "Family medical history",
    symptoms: "Recent symptoms"
  }[step];
}
