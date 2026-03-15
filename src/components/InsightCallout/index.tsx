"use client";

import { SkeletonBlock } from "../SkeletonBlock";

export type InsightCalloutType = "growth" | "warning" | "info" | "achievement";

const TYPE_STYLES: Record<
  InsightCalloutType,
  { border: string; bg: string; labelColor: string }
> = {
  growth: {
    border: "var(--green)",
    bg: "var(--green-muted)",
    labelColor: "var(--green)",
  },
  warning: {
    border: "var(--amber)",
    bg: "var(--amber-dim)",
    labelColor: "var(--amber)",
  },
  info: {
    border: "var(--accent)",
    bg: "var(--accent-muted)",
    labelColor: "var(--accent)",
  },
  achievement: {
    border: "var(--accent)",
    bg: "var(--accent-muted)",
    labelColor: "var(--accent)",
  },
};

export interface InsightCalloutProps {
  text: string;
  type?: InsightCalloutType;
  label?: string;
  action?: { label: string; href: string };
  loading?: boolean;
}

export function InsightCallout({
  text,
  type = "info",
  label,
  action,
  loading = false,
}: InsightCalloutProps) {
  const styles = TYPE_STYLES[type];
  const displayLabel = label ?? (type === "growth" ? "INSIGHT" : type === "warning" ? "TREND" : type === "achievement" ? "ACHIEVEMENT" : "INFO");

  if (loading) {
    return (
      <div
        style={{
          borderLeft: "3px solid var(--border-default)",
          borderRadius: "0 var(--r-md) var(--r-md) 0",
          padding: "12px 16px",
          background: "var(--bg-elevated)",
        }}
      >
        <SkeletonBlock lines={3} lineSpacing={10} height={14} />
      </div>
    );
  }

  return (
    <div
      style={{
        borderLeft: `3px solid ${styles.border}`,
        borderRadius: "0 var(--r-md) var(--r-md) 0",
        padding: "12px 16px",
        background: styles.bg,
      }}
    >
      {displayLabel && (
        <div
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-2xs-size)",
            lineHeight: "var(--text-2xs-line)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: styles.labelColor,
            marginBottom: "6px",
          }}
        >
          {displayLabel}
        </div>
      )}
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-sm-size)",
          lineHeight: 1.7,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {text}
      </p>
      {action && (
        <a
          href={action.href}
          style={{
            display: "inline-block",
            marginTop: "8px",
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-xs-size)",
            color: "var(--accent)",
            textDecoration: "none",
            transition: "text-decoration 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
