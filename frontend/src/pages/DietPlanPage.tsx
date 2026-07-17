import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { getDietPlan } from "../lib/api";
import type { DietPlanResponse } from "../lib/types";
import { useLanguage } from "../hooks/useLanguage";
import { MealCard } from "../components/diet/MealCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export function DietPlanPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [plan, setPlan] = useState<DietPlanResponse | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPlan(null);
    void getDietPlan(language).then(setPlan);
  }, [language]);

  const submitRefinement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
  };

  if (!plan) {
    return <p className="text-lg font-semibold text-warmgray">{t("common.loading")}</p>;
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

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={submitRefinement} className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold text-warmgray">{t("diet.refine")}</span>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t("diet.refinePlaceholder")}
                className="w-full rounded-soft border border-line bg-paper px-4 py-3 text-charcoal"
              />
            </label>
            <Button type="submit" className="self-end" disabled={!message.trim()}>
              <Send className="size-4" aria-hidden="true" />
              {t("diet.send")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
