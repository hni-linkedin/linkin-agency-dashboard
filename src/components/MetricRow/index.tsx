"use client";

import { motion } from "framer-motion";

export interface MetricRowProps {
  label: string;
  value: number;
  displayValue: string;
  maxValue: number;
  percentage?: number;
  rank?: number;
  color?: string;
  /** For stagger animation when in a list */
  index?: number;
}

export function MetricRow({
  label,
  value,
  displayValue,
  maxValue,
  percentage,
  rank,
  color = "var(--accent)",
  index = 0,
}: MetricRowProps) {
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
  const displayPct = percentage != null ? percentage : pct;

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          {rank != null && (
            <span
              data-tabular
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-sm-size)",
                color: "var(--text-muted)",
                width: "24px",
                flexShrink: 0,
              }}
            >
              {rank}
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-sm-size)",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span
            data-tabular
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-sm-size)",
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayValue}
          </span>
          {percentage != null || (maxValue > 0 && value > 0) ? (
            <span
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
                minWidth: "32px",
                textAlign: "right",
              }}
            >
              {displayPct.toFixed(0)}%
            </span>
          ) : null}
        </div>
      </div>
      <div
        style={{
          height: "3px",
          borderRadius: "var(--r-sm)",
          background: "var(--bg-elevated)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: 0.6,
            delay: index * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            height: "100%",
            borderRadius: "var(--r-sm)",
            background: color,
          }}
        />
      </div>
    </motion.div>
  );
}
