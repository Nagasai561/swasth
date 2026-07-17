import { useTranslation } from "react-i18next";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "../../lib/types";
import { Card, CardContent, CardHeader } from "../ui/card";

interface TrendChartProps {
  titleKey: string;
  data: TrendPoint[];
}

export function TrendChart({ titleKey, data }: TrendChartProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-bold uppercase tracking-wide text-warmgray">{t("history.trend")}</p>
        <h3 className="font-serif text-2xl font-semibold text-pine">{t(titleKey)}</h3>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -18, right: 12, top: 12, bottom: 4 }}>
              <CartesianGrid stroke="#E5DED3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6B6459", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6B6459", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderColor: "#E5DED3", borderRadius: 10 }} />
              <Line type="monotone" dataKey="value" stroke="#1E3D32" strokeWidth={3} dot={{ r: 4, fill: "#D98E2B" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
