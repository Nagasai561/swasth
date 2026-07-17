import { useTranslation } from "react-i18next";
import type { MealSuggestion } from "../../lib/types";
import { Card, CardContent, CardHeader } from "../ui/card";

interface MealCardProps {
  meal: MealSuggestion;
}

export function MealCard({ meal }: MealCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-turmeric">{t(`meal.${meal.meal}`)}</p>
        <h3 className="font-serif text-2xl font-semibold text-pine">{meal.title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="leading-7 text-charcoal">{meal.description}</p>
        <div className="rounded-soft bg-paper p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-warmgray">{t("diet.reason")}</p>
          <p className="mt-1 text-sm leading-6 text-charcoal">{meal.reason}</p>
        </div>
      </CardContent>
    </Card>
  );
}
