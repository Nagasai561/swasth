import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight, Upload } from "lucide-react";
import { getReportAnalysis } from "../lib/api";
import type { ReportAnalysisResponse } from "../lib/types";
import { useLanguage } from "../hooks/useLanguage";
import { PanelSection } from "../components/results/PanelSection";
import { Card, CardContent } from "../components/ui/card";
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
    return (
      <Card>
        <CardContent className="space-y-4 pt-5">
          <h1 className="font-serif text-3xl font-semibold text-pine">{t("results.emptyTitle")}</h1>
          <p className="text-warmgray">{t("results.emptyBody")}</p>
          <Link to="/upload" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-soft bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine/90">
            <Upload className="size-4" aria-hidden="true" />
            {t("results.emptyAction")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="space-y-3">
          <h1 className="font-serif text-4xl font-bold text-pine md:text-5xl">{t("results.title")}</h1>
          <p className="max-w-2xl text-lg leading-8 text-warmgray">{t("results.subtitle")}</p>
        </div>

        <Card>
          <CardContent className="grid gap-4 pt-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-warmgray">{t("results.summary")}</p>
              <h2 className="font-serif text-2xl font-semibold text-charcoal">{report.summary}</h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-warmgray">
                <p>
                  {t("common.patient")}: <span className="font-semibold text-charcoal">{report.patient_name}</span>
                </p>
                <p>
                  {t("common.reportDate")}: <span className="font-semibold text-charcoal">{formatDate(report.report_date, language)}</span>
                </p>
              </div>
            </div>
            <Link
              to="/diet"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-soft bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine/90"
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

      <div className="space-y-6">
        <InsightList title={t("results.anomalies")} items={report.analysis.anomalies} />
        <InsightList title={t("results.causes")} items={report.analysis.possible_causes} />
        <InsightList title={t("results.lifestyle")} items={report.analysis.suggested_lifestyle_changes} />
      </div>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl font-semibold text-charcoal">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="rounded-soft border border-line bg-white px-4 py-3 text-sm font-semibold leading-6 text-charcoal shadow-soft">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
