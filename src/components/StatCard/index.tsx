"use client";

import { motion } from "framer-motion";
import { DeltaBadge } from "../DeltaBadge";
import { SkeletonBlock } from "../SkeletonBlock";

function InlineSparkLine({
  data,
  color = "var(--accent)",
  height = 32,
  width = 80,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = height - 4;
  const w = width - 4;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * w + 2;
      const y = h + 2 - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <motion.svg
      width={width}
      height={height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="statcard-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ vectorEffect: "non-scaling-stroke" }}
      />
      <polygon
        fill="url(#statcard-spark)"
        points={`2,${height - 2} ${points} ${width - 2},${height - 2}`}
      />
    </motion.svg>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  trend?: number[];
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  trend,
  loading = false,
  onClick,
}: StatCardProps) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={{
        background: "var(--bg-card)",
        border: "1px dashed var(--border-subtle)",
        boxShadow: "0 0 0 0px transparent",
        borderRadius: "var(--r-md)",
        padding: "20px 24px",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
        cursor: onClick ? "pointer" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-default)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.boxShadow = "0 0 0 0px transparent";
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-xs-size)",
          lineHeight: "var(--text-xs-line)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      {loading ? (
        <SkeletonBlock height={44} width="70%" radius="var(--r-md)" />
      ) : (
        <div
          data-tabular
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-4xl-size)",
            lineHeight: "var(--text-4xl-line)",
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayValue}
        </div>
      )}

      {(delta != null || deltaLabel) && !loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {delta != null && <DeltaBadge value={delta} size="md" />}
          {deltaLabel && (
            <span
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
              }}
            >
              {deltaLabel}
            </span>
          )}
        </div>
      )}

      {trend && trend.length > 0 && !loading && (
        <div style={{ marginTop: "16px" }}>
          <InlineSparkLine data={trend} height={32} width={80} />
        </div>
      )}
    </motion.article>
  );
}
