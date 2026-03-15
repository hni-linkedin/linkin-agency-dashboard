"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { SkeletonBlock } from "../SkeletonBlock";

export interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  showValues?: boolean;
  showPercent?: boolean;
  maxValue?: number;
  loading?: boolean;
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  showPercent = false,
  maxValue: maxValueProp,
  loading = false,
}: BarChartProps) {
  if (loading) {
    return (
      <SkeletonBlock height={height} width="100%" radius="var(--r-md)" />
    );
  }

  const maxVal =
    maxValueProp ?? (data.length ? Math.max(...data.map((d) => d.value)) : 1);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 12,
              fontFamily: "var(--font-data)",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as BarDataPoint;
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
              return (
                <div
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px dashed var(--border-default)",
                    boxShadow: "0 0 0 1px var(--border-default)",
                    borderRadius: "var(--r-md)",
                    padding: "8px 12px",
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-xs-size)",
                    color: "var(--text-primary)",
                  }}
                >
                  {d.label}: {d.value.toLocaleString()}
                  {showPercent && ` (${pct}%)`}
                </div>
              );
            }}
            cursor={{ fill: "var(--bg-elevated)" }}
          />
          <Bar
            dataKey="value"
            fill="var(--accent)"
            radius={[0, 4, 4, 0]}
            maxBarSize={8}
            isAnimationActive
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell key={entry.label} fill={entry.color ?? "var(--accent)"} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
      {showValues && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginTop: "8px",
          }}
        >
          {data.map((d, i) => {
            const pct = total > 0 ? (d.value / total) * 100 : 0;
            return (
              <div
                key={d.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "8px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                }}
              >
                {showPercent && (
                  <span style={{ color: "var(--text-muted)", minWidth: 36 }}>
                    {pct.toFixed(1)}%
                  </span>
                )}
                <span data-tabular style={{ fontVariantNumeric: "tabular-nums" }}>
                  {d.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
