"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { motion } from "framer-motion";
import { SkeletonBlock } from "../SkeletonBlock";

export interface TrendDataPoint {
  session: string;
  date: string;
  [key: string]: string | number;
}

export interface MetricConfig {
  key: string;
  label: string;
  color: string;
  type: "line" | "area";
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  metrics: MetricConfig[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  loading?: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div
      style={{
        background: "var(--bg-overlay)",
        border: "1px dashed var(--border-default)",
        borderRadius: "var(--r-md)",
        padding: "10px 14px",
        fontFamily: "var(--font-data)",
        fontSize: "var(--text-xs-size)",
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          color: "var(--text-muted)",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "2px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "2px",
              background: p.color,
            }}
          />
          <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
          <span data-tabular style={{ fontVariantNumeric: "tabular-nums" }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({
  data,
  metrics,
  height = 200,
  showLegend = true,
  showTooltip = true,
  loading = false,
}: TrendChartProps) {
  if (loading) {
    return <SkeletonBlock height={height} width="100%" radius="var(--r-md)" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--chart-grid)"
            vertical={false}
          />
          <XAxis
            dataKey="session"
            tick={{
              fill: "var(--text-muted)",
              fontSize: 10,
              fontFamily: "var(--font-data)",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: "var(--text-muted)",
              fontSize: 10,
              fontFamily: "var(--font-data)",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
            }
          />
          {showTooltip && (
            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-subtle)" }} />
          )}
          {metrics.map((m) =>
            m.type === "area" ? (
              <Area
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                fill={`url(#area-${m.key})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              />
            ) : (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              />
            )
          )}
          <defs>
            {metrics.filter((m) => m.type === "area").map((m) => (
              <linearGradient
                key={m.key}
                id={`area-${m.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={m.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={m.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
      {showLegend && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "12px",
            justifyContent: "center",
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                color: "var(--text-muted)",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  background: m.color,
                }}
              />
              {m.label}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
