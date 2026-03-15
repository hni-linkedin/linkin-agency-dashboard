"use client";

import { Badge } from "../Badge";

export interface SessionBadgeProps {
  sessionNumber: number;
  date: string;
  captureCount: number;
  isLatest?: boolean;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function SessionBadge({
  sessionNumber,
  date,
  captureCount,
  isLatest = false,
}: SessionBadgeProps) {
  const text = `#${sessionNumber} · ${formatDate(date)} · ${captureCount} capture${captureCount !== 1 ? "s" : ""}`;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {isLatest && (
        <Badge label="Latest" variant="accent" size="sm" />
      )}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "6px 12px",
          borderRadius: "var(--r-full)",
          background: "var(--bg-elevated)",
          border: "1px dashed var(--border-default)",
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-xs-size)",
          lineHeight: "var(--text-xs-line)",
          color: "var(--text-secondary)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
