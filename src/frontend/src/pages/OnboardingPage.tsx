import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { submitProfile } from "../lib/api";
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
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfilePayload>(defaultProfile);

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const saveAndContinue = async () => {
    setError("");
    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    try {
      setIsSaving(true);
      await submitProfile(normalizeProfile(profile), language);
      setIsSaved(true);
      navigate("/upload");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-turmeric">{t("onboarding.progress", { current: stepIndex + 1, total: steps.length })}</p>
          <h1 className="font-serif text-4xl font-bold tracking-normal text-pine md:text-5xl">{t("onboarding.title")}</h1>
          <p className="max-w-2xl text-lg leading-8 text-warmgray">A fuller profile helps the backend interpret your report with your lifestyle, symptoms, medications, and family history in mind.</p>
          <Progress value={progress} />
        </div>
        <div className="grid grid-cols-3 gap-2 self-end lg:grid-cols-2">
          {steps.map((step, index) => (
            <button
              type="button"
              key={step}
              onClick={() => setStepIndex(index)}
              className={cn(
                "min-h-11 rounded-soft border px-3 text-sm font-semibold transition",
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
          <h2 className="font-serif text-3xl font-semibold text-charcoal">{stepTitle(currentStep)}</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === "basics" ? <BasicsStep profile={profile} setProfile={setProfile} /> : null}
          {currentStep === "lifestyle" ? <LifestyleStep profile={profile} setProfile={setProfile} /> : null}
          {currentStep === "conditions" ? (
            <MultiSelectStep
              label="Existing conditions"
              helper="Choose all that apply. Add your own if it is not listed."
              options={existingConditionOptions}
              values={profile.existing_conditions}
              onChange={(existing_conditions) => setProfile((current) => ({ ...current, existing_conditions }))}
            />
          ) : null}
          {currentStep === "medications" ? (
            <MultiSelectStep
              label="Current medications"
              helper="Supplements count too, because they can affect lab values."
              options={medicationOptions}
              values={profile.current_medications}
              onChange={(current_medications) => setProfile((current) => ({ ...current, current_medications }))}
            />
          ) : null}
          {currentStep === "family" ? (
            <MultiSelectStep
              label="Family history"
              helper="These help the analysis understand inherited risk patterns."
              options={familyHistoryOptions}
              values={profile.family_history}
              onChange={(family_history) => setProfile((current) => ({ ...current, family_history }))}
            />
          ) : null}
          {currentStep === "symptoms" ? (
            <MultiSelectStep
              label="Current symptoms"
              helper="Pick anything you have noticed recently."
              options={symptomOptions}
              values={profile.symptoms}
              onChange={(symptoms) => setProfile((current) => ({ ...current, symptoms }))}
            />
          ) : null}

          {error ? <div className="rounded-soft border border-brick/30 bg-brick/5 px-4 py-3 text-sm font-semibold text-brick">{error}</div> : null}

          <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
            <Button type="button" variant="secondary" disabled={stepIndex === 0 || isSaving} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
              {t("common.back")}
            </Button>
            <Button type="button" onClick={saveAndContinue} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : isSaved ? <Check className="size-4" aria-hidden="true" /> : null}
              {stepIndex === steps.length - 1 ? t("common.save") : t("common.continue")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BasicsStep({ profile, setProfile }: { profile: ProfilePayload; setProfile: React.Dispatch<React.SetStateAction<ProfilePayload>> }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <NumberField label="Age" min={1} max={110} value={profile.age} onChange={(age) => setProfile((current) => ({ ...current, age }))} suffix="years" />
      <NumberField label="Weight" min={20} max={220} value={profile.weight} onChange={(weight) => setProfile((current) => ({ ...current, weight }))} suffix="kg" />
      <NumberField label="Height" min={90} max={230} value={profile.height} onChange={(height) => setProfile((current) => ({ ...current, height }))} suffix="cm" />
      <div className="md:col-span-2">
        <SegmentedControl<Sex> label="Sex" values={["Female", "Male"]} selected={profile.sex} onSelect={(sex) => setProfile((current) => ({ ...current, sex, pregnant: sex === "Female" ? current.pregnant : false }))} />
      </div>
      <label className={cn("flex min-h-[74px] items-center justify-between rounded-soft border border-line bg-paper px-4 py-3", profile.sex !== "Female" && "opacity-55")}>
        <span>
          <span className="block text-sm font-semibold text-charcoal">Currently pregnant</span>
          <span className="text-sm text-warmgray">Used only when applicable for interpretation.</span>
        </span>
        <input
          type="checkbox"
          checked={profile.pregnant}
          disabled={profile.sex !== "Female"}
          onChange={(event) => setProfile((current) => ({ ...current, pregnant: event.target.checked }))}
          className="size-5 accent-pine"
        />
      </label>
    </div>
  );
}

function LifestyleStep({ profile, setProfile }: { profile: ProfilePayload; setProfile: React.Dispatch<React.SetStateAction<ProfilePayload>> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SelectField<SmokingStatus> label="Smoking" value={profile.lifestyle.smoking} options={["Never", "Former Smoker", "Occasionally", "Daily"]} onChange={(smoking) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, smoking } }))} />
      <SelectField<AlcoholStatus> label="Alcohol" value={profile.lifestyle.alcohol} options={["Never", "Occasionally", "Weekly", "Daily"]} onChange={(alcohol) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, alcohol } }))} />
      <SelectField<ExerciseStatus> label="Exercise" value={profile.lifestyle.exercise} options={["None", "1-2 days/week", "3-5 days/week", "6-7 days/week"]} onChange={(exercise) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, exercise } }))} />
      <SelectField<BackendDiet> label="Diet pattern" value={profile.lifestyle.diet} options={["Vegetarian", "Vegan", "Mixed"]} onChange={(diet) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, diet } }))} />
      <div className="md:col-span-2">
        <SegmentedControl<SleepStatus> label="Sleep" values={["<5 hours", "5-6 hours", "7-8 hours", "8+ hours"]} selected={profile.lifestyle.sleep} onSelect={(sleep) => setProfile((current) => ({ ...current, lifestyle: { ...current.lifestyle, sleep } }))} />
      </div>
    </div>
  );
}

function NumberField({ label, min, max, value, suffix, onChange }: { label: string; min: number; max: number; value: number; suffix: string; onChange: (value: number) => void }) {
  const [draftValue, setDraftValue] = useState(String(value));
  const clamp = (nextValue: number) => Math.min(max, Math.max(min, nextValue));
  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraftValue = event.target.value;
    setDraftValue(nextDraftValue);

    if (nextDraftValue === "") {
      return;
    }

    const nextValue = Number(nextDraftValue);
    if (Number.isFinite(nextValue)) {
      onChange(clamp(nextValue));
    }
  };
  const commit = () => {
    const nextValue = Number(draftValue);
    const nextClampedValue = Number.isFinite(nextValue) ? clamp(nextValue) : value;
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
    <div className="rounded-soft border border-line bg-paper p-4">
      <label htmlFor={`profile-${label.toLowerCase()}`} className="text-sm font-semibold text-warmgray">
        {label}
      </label>
      <div className="mt-2 flex min-h-14 items-center overflow-hidden rounded-soft border border-line bg-white">
        <button type="button" onClick={() => nudge(-1)} disabled={value <= min} className="grid size-12 shrink-0 place-items-center border-r border-line text-pine transition hover:bg-pine/5 disabled:cursor-not-allowed disabled:opacity-40">
          <Minus className="size-4" aria-hidden="true" />
          <span className="sr-only">Decrease {label}</span>
        </button>
        <div className="flex min-w-0 flex-1 items-baseline px-3">
          <input
            id={`profile-${label.toLowerCase()}`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={draftValue}
            onChange={update}
            onBlur={commit}
            className="min-w-0 flex-1 bg-transparent text-center text-3xl font-bold text-pine outline-none"
          />
          <span className="ml-2 shrink-0 text-sm font-semibold text-warmgray">{suffix}</span>
        </div>
        <button type="button" onClick={() => nudge(1)} disabled={value >= max} className="grid size-12 shrink-0 place-items-center border-l border-line text-pine transition hover:bg-pine/5 disabled:cursor-not-allowed disabled:opacity-40">
          <Plus className="size-4" aria-hidden="true" />
          <span className="sr-only">Increase {label}</span>
        </button>
      </div>
    </div>
  );
}

function SelectField<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (value: T) => void }) {
  return (
    <label className="block rounded-soft border border-line bg-paper p-4">
      <span className="text-sm font-semibold text-warmgray">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="mt-2 w-full rounded-soft border border-line bg-white px-3 py-3 font-semibold text-charcoal">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SegmentedControl<T extends string>({ label, values, selected, onSelect }: { label: string; values: T[]; selected: T; onSelect: (value: T) => void }) {
  return (
    <div className="rounded-soft border border-line bg-paper p-4">
      <p className="text-sm font-semibold text-warmgray">{label}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => onSelect(value)}
            className={cn("min-h-11 rounded-soft border px-3 text-sm font-semibold transition", selected === value ? "border-pine bg-pine text-white" : "border-line bg-white text-charcoal hover:border-pine")}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectStep({ label, helper, options, values, onChange }: { label: string; helper: string; options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  const [customValue, setCustomValue] = useState("");

  const toggle = (option: string) => {
    if (option === "None") {
      onChange(["None"]);
      return;
    }

    const withoutNone = values.filter((value) => value !== "None");
    onChange(withoutNone.includes(option) ? withoutNone.filter((value) => value !== option) : [...withoutNone, option]);
  };

  const addCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed) {
      return;
    }
    onChange([...values.filter((value) => value !== "None"), trimmed]);
    setCustomValue("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-charcoal">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-warmgray">{helper}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={cn("min-h-12 rounded-soft border px-4 py-3 text-left text-sm font-semibold transition", values.includes(option) ? "border-pine bg-pine text-white" : "border-line bg-paper text-charcoal hover:border-pine")}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-soft border border-line bg-paper p-3 sm:flex-row">
        <input value={customValue} onChange={(event) => setCustomValue(event.target.value)} placeholder="Add another option" className="min-h-11 flex-1 rounded-soft border border-line bg-white px-3 text-charcoal" />
        <Button type="button" variant="secondary" onClick={addCustom} disabled={!customValue.trim()}>
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
