import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { LabValue } from "../../lib/types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { StatusBadge } from "../ui/statusBadge";
import { Button } from "../ui/button";

interface ValueCardProps {
  value: LabValue;
}

const statusKey = {
  good: "common.good",
  watch: "common.watch",
  attention: "common.attention"
};

const summaryKey = {
  good: "results.value.inRange",
  watch: "results.value.watch",
  attention: "results.value.attention"
};

export function ValueCard({ value }: ValueCardProps) {
  const { t } = useTranslation();
  const [showMedical, setShowMedical] = useState(false);
  const range = `${value.ref_low}-${value.ref_high} ${value.unit}`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <StatusBadge flag={value.flag} label={t(statusKey[value.flag])} />
              <h3 className="font-serif text-2xl font-semibold leading-tight text-pine">{t(summaryKey[value.flag], { name: value.test_name })}</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-warmgray">{t("results.value.explanation", { value: value.value, unit: value.unit, range })}</p>
          <div className="grid grid-cols-2 gap-3 rounded-soft bg-paper p-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{t("common.value")}</p>
              <p className="mt-1 font-semibold text-charcoal">
                {value.value} {value.unit}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-warmgray">{t("common.range")}</p>
              <p className="mt-1 font-semibold text-charcoal">
                {value.ref_low}-{value.ref_high} {value.unit}
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" className="min-h-9 px-0" onClick={() => setShowMedical((current) => !current)}>
            {showMedical ? t("common.hideMedical") : t("common.showMedical")}
          </Button>
          {showMedical ? (
            <div className="rounded-soft border border-line bg-white px-3 py-2 text-sm text-warmgray">
              <span className="font-semibold text-charcoal">{value.plain_label}:</span> {value.test_name}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
