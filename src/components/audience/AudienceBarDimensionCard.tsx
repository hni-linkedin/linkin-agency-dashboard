"use client";

import type { AudiencePercentageItem } from "@/types/audience";
import { normalizeAudiencePercentage, sortByAudiencePercentageDesc } from "@/lib/audience/percent";
import { AudienceBarRow } from "./AudienceBarRow";

export type AudienceBarDimensionCardProps = {
  label: string;
  items: AudiencePercentageItem[];
  heroOverrideTitle?: string;
  heroOverridePercentage?: string;
};

export function AudienceBarDimensionCard({
  label,
  items,
}: AudienceBarDimensionCardProps) {
  const sorted = sortByAudiencePercentageDesc(items);
  const hero = sorted[0] ?? null;
  const remaining = sorted.slice(1, 5);
  const maxPct = Math.max(
    1,
    ...[hero, ...remaining].map((i) => normalizeAudiencePercentage(i?.percentage ?? "0%")),
  );

  const insightPrefix = hero ? `${hero.title} leads ${label.toLowerCase()} at ` : null;
  const insightAccent = hero?.percentage ?? null;
  const insightSuffix = hero ? "." : null;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px dashed var(--border-card)",
        borderRadius: "var(--r-md)",
        padding: "1rem 1.2rem",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
        {label}
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 3 }}>
        {hero?.title ?? "—"}
      </div>
      <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 10 }}>
        {hero?.percentage ?? "—"} {hero ? "of audience" : ""}
      </div>

      <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {remaining.length > 0 ? (
          remaining.map((item, idx) => {
            const valuePct = normalizeAudiencePercentage(item.percentage);
            return (
              <AudienceBarRow
                key={item.title}
                item={item}
                valuePct={valuePct}
                maxPct={maxPct}
                accent={idx === 0}
              />
            );
          })
        ) : (
          <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)", paddingTop: 6 }}>—</div>
        )}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px dashed var(--border-subtle)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.6 }}>
        {insightPrefix && insightAccent && insightSuffix ? (
          <>
            {insightPrefix}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{insightAccent}</span>
            {insightSuffix}
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}

