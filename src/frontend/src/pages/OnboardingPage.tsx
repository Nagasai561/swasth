import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { submitProfile } from "../lib/api";
import type { ActivityLevel, DietPreference, Gender, HealthGoal, ProfilePayload } from "../lib/types";
import { useLanguage } from "../hooks/useLanguage";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";

type StepKey = "age" | "gender" | "diet" | "activity" | "goal";

const steps: StepKey[] = ["age", "gender", "diet", "activity", "goal"];

export function OnboardingPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [profile, setProfile] = useState<ProfilePayload>({
    age: 35,
    gender: "female",
    dietPreference: "veg",
    activityLevel: "moderate",
    goal: "sugar"
  });

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const optionGroups = useMemo(
    () => ({
      gender: ["female", "male", "non_binary", "prefer_not"] as Gender[],
      diet: ["veg", "non_veg", "egg"] as DietPreference[],
      activity: ["low", "moderate", "high"] as ActivityLevel[],
      goal: ["energy", "weight", "sugar", "heart"] as HealthGoal[]
    }),
    []
  );

  const saveAndContinue = async () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    await submitProfile(profile, language);
    setIsSaved(true);
    navigate("/upload");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-turmeric">{t("onboarding.progress", { current: stepIndex + 1, total: steps.length })}</p>
        <h1 className="font-serif text-4xl font-bold tracking-normal text-pine md:text-5xl">{t("onboarding.title")}</h1>
        <p className="max-w-2xl text-lg leading-8 text-warmgray">{t("onboarding.subtitle")}</p>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-serif text-3xl font-semibold text-charcoal">{t(`onboarding.${currentStep}.title`)}</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === "age" ? (
            <input
              type="number"
              min={1}
              value={profile.age}
              placeholder={t("onboarding.age.placeholder")}
              onChange={(event) => setProfile((current) => ({ ...current, age: Number(event.target.value) }))}
              className="w-full rounded-soft border border-line bg-paper px-4 py-3 text-2xl font-semibold text-charcoal"
            />
          ) : null}

          {currentStep === "gender" ? (
            <OptionGrid
              values={optionGroups.gender}
              selected={profile.gender}
              labelFor={(value) => t(`onboarding.gender.${value}`)}
              onSelect={(gender) => setProfile((current) => ({ ...current, gender }))}
            />
          ) : null}

          {currentStep === "diet" ? (
            <OptionGrid
              values={optionGroups.diet}
              selected={profile.dietPreference}
              labelFor={(value) => t(`onboarding.diet.${value}`)}
              onSelect={(dietPreference) => setProfile((current) => ({ ...current, dietPreference }))}
            />
          ) : null}

          {currentStep === "activity" ? (
            <OptionGrid
              values={optionGroups.activity}
              selected={profile.activityLevel}
              labelFor={(value) => t(`onboarding.activity.${value}`)}
              onSelect={(activityLevel) => setProfile((current) => ({ ...current, activityLevel }))}
            />
          ) : null}

          {currentStep === "goal" ? (
            <OptionGrid
              values={optionGroups.goal}
              selected={profile.goal}
              labelFor={(value) => t(`onboarding.goal.${value}`)}
              onSelect={(goal) => setProfile((current) => ({ ...current, goal }))}
            />
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
              {t("common.back")}
            </Button>
            <Button type="button" onClick={saveAndContinue}>
              {isSaved ? <Check className="size-4" aria-hidden="true" /> : null}
              {stepIndex === steps.length - 1 ? t("common.save") : t("common.continue")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface OptionGridProps<T extends string> {
  values: T[];
  selected: T;
  labelFor: (value: T) => string;
  onSelect: (value: T) => void;
}

function OptionGrid<T extends string>({ values, selected, labelFor, onSelect }: OptionGridProps<T>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {values.map((value) => (
        <button
          type="button"
          key={value}
          onClick={() => onSelect(value)}
          className={cn(
            "rounded-soft border px-4 py-4 text-left text-base font-semibold transition",
            selected === value ? "border-pine bg-pine text-white" : "border-line bg-paper text-charcoal hover:border-pine"
          )}
        >
          {labelFor(value)}
        </button>
      ))}
    </div>
  );
}
