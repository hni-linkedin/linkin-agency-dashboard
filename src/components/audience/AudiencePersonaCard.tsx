"use client";

import type {
  AudienceDemographicsData,
  AudiencePercentageItem,
} from "@/types/audience";
import {
  normalizeAudiencePercentage,
  sortByAudiencePercentageDesc,
} from "@/lib/audience/percent";

function getTop(items: AudiencePercentageItem[] | undefined | null) {
  if (!items || items.length === 0) return null;
  return sortByAudiencePercentageDesc(items)[0] ?? null;
}

function replaceEntryLabel(s: string) {
  const t = s.toLowerCase();
  if (t === "entry") return "Entry-level";
  return s;
}

function sumTop2Pct(a: AudiencePercentageItem[], topN = 2) {
  const sorted = sortByAudiencePercentageDesc(a);
  return sorted
    .slice(0, topN)
    .reduce((acc, i) => acc + normalizeAudiencePercentage(i.percentage), 0);
}

function ChipDot({ variant }: { variant: "blue" | "amber" | "teal" }) {
  const bg =
    variant === "blue"
      ? "var(--accent)"
      : variant === "amber"
        ? "var(--amber)"
        : "var(--teal)";
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: bg,
        flexShrink: 0,
        marginTop: 3,
      }}
    />
  );
}

export function AudiencePersonaCard({
  data,
}: {
  data: AudienceDemographicsData;
}) {
  const topJob = getTop(data.job_title);
  const topIndustry = getTop(data.industry);
  const topSeniority = getTop(data.seniority);
  const topLocations = sortByAudiencePercentageDesc(data.location).slice(0, 2);

  const loc1 = topLocations[0] ?? null;
  const loc2 = topLocations[1] ?? null;
  const sen1 = topSeniority?.title ?? "";
  const sen2 = sortByAudiencePercentageDesc(data.seniority)[1]?.title ?? "";

  const personaTitle =
    topSeniority && topJob && loc1
      ? `${replaceEntryLabel(topSeniority.title)} ${topJob.title} in ${loc1.title}`
      : "—";

  const personaSub =
    loc1 && loc2 && topIndustry
      ? `Heavy ${loc1.title} + ${loc2.title} concentration · ${topIndustry.title} leads industries`
      : "—";

  const chip1 = topIndustry
    ? `${topIndustry.percentage} of audience is in ${topIndustry.title}`
    : null;
  const chip2 =
    loc1 && loc2
      ? `${(normalizeAudiencePercentage(loc1.percentage) + normalizeAudiencePercentage(loc2.percentage)).toFixed(1)}% ${loc1.title} + ${loc2.title} concentration`
      : null;
  const chip3 = data.seniority?.length
    ? `${sumTop2Pct(data.seniority).toFixed(1)}% ${sen1}${sen2 ? " + " + sen2 : ""} mix`
    : null;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px dashed var(--border-card)",
        borderRadius: "var(--r-md)",
        padding: "1.4rem 1.6rem",
        marginBottom: "1rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.2rem",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 6,
          }}
        >
          Audience profile
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          {personaTitle.split(" ").slice(0, 4).join(" ")}
          {personaTitle.split(" ").length > 4 ? <br /> : null}
          {personaTitle.split(" ").slice(4).join(" ")}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          {personaSub}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {chip1 && (
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "9px 13px",
              fontSize: 12,
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              lineHeight: 1.5,
            }}
          >
            <ChipDot variant="blue" />
            <span>{chip1}</span>
          </div>
        )}
        {chip2 && (
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "9px 13px",
              fontSize: 12,
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              lineHeight: 1.5,
            }}
          >
            <ChipDot variant="amber" />
            <span>{chip2}</span>
          </div>
        )}
        {chip3 && (
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "9px 13px",
              fontSize: 12,
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "flex-start",
              gap: 9,
              lineHeight: 1.5,
            }}
          >
            <ChipDot variant="teal" />
            <span>{chip3}</span>
          </div>
        )}
      </div>
    </div>
  );
}
