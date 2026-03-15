"use client";

import { motion } from "framer-motion";
import { SkeletonBlock } from "../SkeletonBlock";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  strokeWidth?: number;
  loading?: boolean;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 160,
  strokeWidth = 20,
  loading = false,
}: DonutChartProps) {
  if (loading) {
    return (
      <SkeletonBlock
        width={size}
        height={size}
        radius="var(--r-full)"
      />
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const gap = 2;
  const circumference = 2 * Math.PI * r;

  const segments = data.reduce<Array<{ offset: number; length: number; pct: number; label: string; value: number; color: string }>>((acc, d, i) => {
    const pct = total > 0 ? d.value / total : 0;
    const length = pct * circumference - (i < data.length - 1 ? gap : 0);
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].length + gap : 0;
    acc.push({ ...d, offset, length, pct: pct * 100 });
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${seg.length} ${circumference}`}
              strokeDashoffset={-seg.offset}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${seg.length} ${circumference}` }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {centerLabel != null && (
            <span
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
              }}
            >
              {centerLabel}
            </span>
          )}
          {centerValue != null && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-2xl-size)",
                lineHeight: "var(--text-2xl-line)",
                letterSpacing: "var(--text-2xl-tracking)",
                color: "var(--text-primary)",
              }}
            >
              {typeof centerValue === "number"
                ? centerValue.toLocaleString()
                : centerValue}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px 16px",
          justifyContent: "center",
        }}
      >
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "var(--r-sm)",
                background: seg.color,
              }}
            />
            {seg.label} · {seg.pct.toFixed(0)}%
          </div>
        ))}
      </div>
    </motion.div>
  );
}
