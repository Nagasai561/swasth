import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getReportAnalysis } from "../lib/api";
import type { ReportAnalysisResponse } from "../lib/types";
import { useLanguage } from "../hooks/useLanguage";
import { PanelSection } from "../components/results/PanelSection";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { formatDate } from "../lib/utils";

export function ResultsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [report, setReport] = useState<ReportAnalysisResponse | null>(null);

  useEffect(() => {
    setReport(null);
    void getReportAnalysis(language).then(setReport);
  }, [language]);

  if (!report) {
    return <p className="text-lg font-semibold text-warmgray">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <h1 className="font-serif text-4xl font-bold text-pine md:text-5xl">{t("results.title")}</h1>
          <p className="max-w-2xl text-lg leading-8 text-warmgray">{t("results.subtitle")}</p>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs font-bold uppercase tracking-wide text-warmgray">{t("results.summary")}</p>
            <h2 className="font-serif text-2xl font-semibold text-charcoal">{report.summary}</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-warmgray">
            <p>
              {t("common.patient")}: <span className="font-semibold text-charcoal">{report.patient_name}</span>
            </p>
            <p>
              {t("common.reportDate")}: <span className="font-semibold text-charcoal">{formatDate(report.report_date, language)}</span>
            </p>
            <Link
              to="/diet"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-soft bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine/90"
            >
              {t("results.next")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        {report.groups.map((group) => (
          <PanelSection group={group} key={group.panel} />
        ))}
      </div>
    </div>
  );
}
