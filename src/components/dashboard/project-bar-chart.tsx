"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type ProjectBarChartProps = {
  data: { project: string; total: number }[];
};

export function ProjectBarChart({ data }: ProjectBarChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        No approved claims this month
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.project, total: d.total }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `฿${v}`} />
        <Tooltip
          formatter={(value: number) => [`฿${value.toLocaleString()}`, "Total"]}
          contentStyle={{ borderRadius: "8px" }}
        />
        <Bar dataKey="total" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
