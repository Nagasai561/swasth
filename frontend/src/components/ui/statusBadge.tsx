import { CircleCheck, CircleAlert, Eye } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ReportFlag } from "../../lib/types";

interface StatusBadgeProps {
  flag: ReportFlag;
  label: string;
}

const styles: Record<ReportFlag, string> = {
  good: "bg-sage/12 text-sage",
  watch: "bg-turmeric/15 text-[#8A5315]",
  attention: "bg-brick/12 text-brick"
};

const icons = {
  good: CircleCheck,
  watch: Eye,
  attention: CircleAlert
};

export function StatusBadge({ flag, label }: StatusBadgeProps) {
  const Icon = icons[flag];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", styles[flag])}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
