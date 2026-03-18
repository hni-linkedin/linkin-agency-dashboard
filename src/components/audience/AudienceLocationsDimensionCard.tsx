"use client";

import type { AudiencePercentageItem } from "@/types/audience";
import { normalizeAudiencePercentage, sortByAudiencePercentageDesc } from "@/lib/audience/percent";
import { AudienceLocationsMap } from "./AudienceLocationsMap";

export function AudienceLocationsDimensionCard({
  label,
  items,
}: {
  label: string;
  items: AudiencePercentageItem[];
}) {
  const sorted = sortByAudiencePercentageDesc(items);
  const hero = sorted[0] ?? null;
  const second = sorted[1] ?? null;
  const maxPct = Math.max(
    1,
    ...sorted.map((i) => normalizeAudiencePercentage(i.percentage)),
  );

  const getHeatColor = (pct: number) => {
    const t = pct / maxPct; // 0..1
    if (t >= 0.75) return "var(--red)";
    if (t >= 0.5) return "var(--amber)";
    if (t >= 0.25) return "var(--teal)";
    return "var(--accent)";
  };

  const insight =
    hero && second
      ? `${(normalizeAudiencePercentage(hero.percentage) + normalizeAudiencePercentage(second.percentage)).toFixed(1)}% concentrated across ${hero.title} + ${second.title}`
      : hero
        ? `${hero.percentage} concentrated in ${hero.title}`
        : null;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px dashed var(--border-card)",
        borderRadius: "var(--r-md)",
        padding: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
          {label}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 3 }}>
          {hero?.title ?? "—"}
        </div>
        <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 10 }}>
          {hero?.percentage ?? "—"} of audience
        </div>
        <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
          {sorted.slice(1, 5).map((item) => (
            <div key={item.title} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={item.title}>
                {item.title}
              </span>
              <div style={{ width: 56, height: 2, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(
                      100,
                      Math.max(
                        6,
                        Math.round(
                          (normalizeAudiencePercentage(item.percentage) /
                            Math.max(1, normalizeAudiencePercentage(hero?.percentage ?? "1%"))) *
                            100,
                        ),
                      ),
                    )}%`,
                    borderRadius: 2,
                    background: getHeatColor(normalizeAudiencePercentage(item.percentage)),
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: getHeatColor(normalizeAudiencePercentage(item.percentage)),
                  minWidth: 44,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {item.percentage}
              </span>
            </div>
          ))}
          {sorted.length <= 1 && (
            <div style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)", paddingTop: 6 }}>
              —
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px dashed var(--border-subtle)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.6 }}>
          {insight ? (
            <>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{insight}</span>
            </>
          ) : (
            "—"
          )}
        </div>
      </div>

      <AudienceLocationsMap items={items} />
    </div>
  );
}

