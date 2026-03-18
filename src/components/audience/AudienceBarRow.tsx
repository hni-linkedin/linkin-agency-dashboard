"use client";

import type { AudiencePercentageItem } from "@/types/audience";

export type AudienceBarRowProps = {
  item: AudiencePercentageItem;
  valuePct: number; // normalized numeric percentage value (for width scaling)
  maxPct: number; // normalized max among visible items
  accent?: boolean;
};

export function AudienceBarRow({
  item,
  valuePct,
  maxPct,
  accent = false,
}: AudienceBarRowProps) {
  const widthPct = Math.max(2, Math.round((valuePct / Math.max(1e-6, maxPct)) * 100));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
      <span
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 11,
          color: "var(--text-secondary)",
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
        }}
        title={item.title}
      >
        {item.title}
      </span>

      <div
        style={{
          width: 56,
          height: 2,
          background: "var(--border-subtle)",
          borderRadius: 2,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${widthPct}%`,
            borderRadius: 2,
            background: accent ? "var(--accent)" : "var(--text-muted)",
          }}
        />
      </div>

      <span
        style={{
          fontFamily: "var(--font-data)",
          fontSize: 11,
          color: "var(--text-muted)",
          minWidth: 28,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {item.percentage}
      </span>
    </div>
  );
}

