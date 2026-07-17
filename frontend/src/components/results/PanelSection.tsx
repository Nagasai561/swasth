import { Activity, Droplets, Heart, Leaf, ShieldPlus, Wheat } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReportGroup, ReportPanel } from "../../lib/types";
import { ValueCard } from "./ValueCard";

interface PanelSectionProps {
  group: ReportGroup;
}

const panelIcons = {
  heart_fats: Heart,
  blood_sugar: Wheat,
  blood_health: Droplets,
  kidneys: Activity,
  liver: Leaf,
  thyroid: ShieldPlus
} satisfies Record<ReportPanel, typeof Heart>;

export function PanelSection({ group }: PanelSectionProps) {
  const { t } = useTranslation();
  const Icon = panelIcons[group.panel];

  if (group.values.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-soft bg-pine/10 text-pine">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-serif text-2xl font-semibold text-charcoal">{t(`panel.${group.panel}`)}</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {group.values.map((value) => (
          <ValueCard value={value} key={value.id} />
        ))}
      </div>
    </section>
  );
}
