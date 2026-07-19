import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { getDietPlan } from "../lib/api";
import type { DietPlanResponse } from "../lib/types";
import { useLanguage } from "../hooks/useLanguage";
import { MealCard } from "../components/diet/MealCard";
import { Card, CardContent } from "../components/ui/card";

export function DietPlanPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [plan, setPlan] = useState<DietPlanResponse | null>(null);

  useEffect(() => {
    setPlan(null);
    void getDietPlan(language).then(setPlan);
  }, [language]);

  if (!plan) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-5">
          <h1 className="font-serif text-3xl font-semibold text-pine">{t("diet.emptyTitle")}</h1>
          <p className="text-warmgray">{t("diet.emptyBody")}</p>
          <Link to="/upload" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-soft bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine/90">
            <Upload className="size-4" aria-hidden="true" />
            {t("diet.emptyAction")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <h1 className="font-serif text-4xl font-bold text-pine md:text-5xl">{t("diet.title")}</h1>
        <p className="max-w-2xl text-lg leading-8 text-warmgray">{t("diet.subtitle")}</p>
      </div>

      <Card className="bg-pine text-white">
        <CardContent className="pt-5">
          <p className="font-serif text-3xl font-semibold leading-tight">{plan.headline}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {plan.meals.map((meal) => (
          <MealCard meal={meal} key={meal.id} />
        ))}
      </div>

    </div>
  );
}
