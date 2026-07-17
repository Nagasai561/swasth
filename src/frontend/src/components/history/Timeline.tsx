import { useTranslation } from "react-i18next";
import type { HistoryReport } from "../../lib/types";
import { formatDate } from "../../lib/utils";
import { Card } from "../ui/card";

interface TimelineProps {
  reports: HistoryReport[];
  locale: string;
}

export function Timeline({ reports, locale }: TimelineProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-2xl font-semibold text-charcoal">{t("history.timeline")}</h2>
      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-turmeric">{formatDate(report.date, locale)}</p>
                <h3 className="mt-1 font-serif text-xl font-semibold text-pine">{report.title}</h3>
              </div>
              <ul className="space-y-1 text-sm text-warmgray">
                {report.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
