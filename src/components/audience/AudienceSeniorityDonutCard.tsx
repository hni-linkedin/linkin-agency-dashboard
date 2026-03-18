"use client";

import type { AudiencePercentageItem } from "@/types/audience";
import { normalizeAudiencePercentage, sortByAudiencePercentageDesc } from "@/lib/audience/percent";

const COLORS = [
  "var(--accent)",
  "var(--teal)",
  "var(--amber)",
  "var(--green)",
  "var(--red)",
];

export function AudienceSeniorityDonutCard({ items }: { items: AudiencePercentageItem[] }) {
  const sorted = sortByAudiencePercentageDesc(items);
  const visible = sorted.slice(0, 5);
  const top = visible[0] ?? null;

  const normalized = visible.map((i) => normalizeAudiencePercentage(i.percentage));
  const total = normalized.reduce((a, b) => a + b, 0);

  const size = 128;
  const strokeWidth = 16;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const gap = 2;
  const circumference = 2 * Math.PI * r;
  const segments = visible.reduce<
    Array<{ offset: number; length: number; label: string; value: number; color: string }>
  >((acc, item, idx) => {
    const value = normalized[idx] ?? 0;
    const pct = total > 0 ? value / total : 0;
    const length = Math.max(0, pct * circumference - (idx < visible.length - 1 ? gap : 0));
    const offset =
      acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].length + gap : 0;
    acc.push({
      offset,
      length,
      label: item.title,
      value,
      color: COLORS[idx] ?? COLORS[COLORS.length - 1],
    });
    return acc;
  }, []);

  const topPctText = top?.percentage ? top.percentage.replace("%", "").trim() : "0";

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px dashed var(--border-card)",
        borderRadius: "var(--r-md)",
        padding: "1rem 1.2rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
        Seniority
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, justifyContent: "space-between" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />

          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {segments.map((seg, idx) => (
              <circle
                key={`${seg.label}-${idx}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${seg.length} ${circumference}`}
                strokeDashoffset={-seg.offset}
              />
            ))}
          </g>

          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fontSize={22}
            fontWeight={500}
            fill="var(--text-primary)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {topPctText}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            fontSize={12}
            fill="var(--text-muted)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {top?.title ?? ""}
          </text>
        </svg>

        <div style={{ width: 160, marginLeft: "auto" }}>
          {visible.map((v, idx) => (
            <div
              key={v.title}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
                fontSize: 10,
                marginBottom: 2,
                width: "100%",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: COLORS[idx] ?? COLORS[4],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: COLORS[idx] ?? "var(--text-secondary)",
                }}
              >
                {v.title}
              </span>
              <span
                style={{
                  color: COLORS[idx] ?? "var(--text-muted)",
                  flexShrink: 0,
                  minWidth: 52,
                  textAlign: "right",
                }}
              >
                {v.percentage}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px dashed var(--border-subtle)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.6 }}>
        {visible.length >= 2 ? (
          <>
            {visible[0].title} and {visible[1].title} lead the distribution -{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              two audience cohorts
            </span>
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}

