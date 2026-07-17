import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getHistory } from "../lib/api";
import type { HistoryResponse } from "../lib/types";
import { useLanguage } from "../hooks/useLanguage";
import { Timeline } from "../components/history/Timeline";
import { TrendChart } from "../components/history/TrendChart";

export function HistoryPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    setHistory(null);
    void getHistory(language).then(setHistory);
  }, [language]);

  if (!history) {
    return <p className="text-lg font-semibold text-warmgray">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <h1 className="font-serif text-4xl font-bold text-pine md:text-5xl">{t("history.title")}</h1>
        <p className="max-w-2xl text-lg leading-8 text-warmgray">{t("history.subtitle")}</p>
      </div>

      {history.reports.length > 0 ? <Timeline reports={history.reports} locale={language} /> : <p className="text-warmgray">{t("history.empty")}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart titleKey="history.hba1c" data={history.trends.hba1c} />
        <TrendChart titleKey="history.ldl" data={history.trends.ldl} />
      </div>
    </div>
  );
}
