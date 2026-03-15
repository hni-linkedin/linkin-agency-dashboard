"use client";

import { motion, AnimatePresence } from "framer-motion";

export type FreshnessStatus = "fresh" | "due" | "overdue";

const STATUS_STYLES: Record<
  FreshnessStatus,
  { dot: string; text: string; bg: string; border: string; label: string }
> = {
  fresh: {
    dot: "var(--green)",
    text: "var(--green)",
    bg: "var(--green-muted)",
    border: "var(--green-border)",
    label: "Captured",
  },
  due: {
    dot: "var(--amber)",
    text: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "var(--amber-border)",
    label: "Due",
  },
  overdue: {
    dot: "var(--red)",
    text: "var(--red)",
    bg: "var(--red-dim)",
    border: "var(--red-border)",
    label: "Overdue",
  },
};

function formatDaysAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export interface FreshnessIndicatorProps {
  status: FreshnessStatus;
  label: string;
  lastCapture?: string;
  daysUntilDue?: number;
  compact?: boolean;
}

export function FreshnessIndicator({
  status,
  label,
  lastCapture,
  daysUntilDue,
  compact = false,
}: FreshnessIndicatorProps) {
  const styles = STATUS_STYLES[status];
  const showPulse = status === "due" || status === "overdue";

  const statusLabel =
    status === "fresh" && lastCapture
      ? `${styles.label} · ${formatDaysAgo(lastCapture)}`
      : status === "due"
        ? `${styles.label} · Capture today`
        : status === "overdue" && daysUntilDue != null
          ? `${styles.label} · ${daysUntilDue} days late`
          : styles.label;

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 8px",
          borderRadius: "var(--r-sm)",
          background: styles.bg,
          border: "1px dashed",
          borderColor: styles.border,
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "var(--r-full)",
            background: styles.dot,
            flexShrink: 0,
            animation: showPulse ? "pulse-dot 1.8s ease-in-out infinite" : undefined,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-xs-size)",
            color: styles.text,
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
          borderRadius: "var(--r-sm)",
          background: styles.bg,
          border: "1px dashed",
          borderColor: styles.border,
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "var(--r-full)",
            background: styles.dot,
            flexShrink: 0,
            animation: showPulse ? "pulse-dot 1.8s ease-in-out infinite" : undefined,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-xs-size)",
            color: styles.text,
          }}
        >
          {label} · {statusLabel}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
