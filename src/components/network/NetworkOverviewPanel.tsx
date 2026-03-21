"use client";

import type { CSSProperties } from "react";
import type { NetworkOverviewData } from "@/types/network";
import {
  formatFollowerConnectionMultiplier,
  parseFollowerToConnectionRatio,
} from "@/lib/network/followerRatio";
import { StatCard, Badge } from "@/components";
import { NetworkAvatar } from "./NetworkAvatar";

const CARD: CSSProperties = {
  background: "var(--bg-card)",
  border: "1px dashed var(--border-card)",
  borderRadius: "var(--r-md)",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
};

const HOVER_CARD = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = "var(--border-default)";
    e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-card)";
  },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = "var(--border-card)";
    e.currentTarget.style.boxShadow = "none";
  },
} as const;

export type NetworkOverviewPanelProps = {
  data: NetworkOverviewData;
  onGoToFollowersOverlaps: () => void;
  onGoToFollowingOneSided: () => void;
};

function InsightFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: "auto",
        paddingTop: 10,
        borderTop: "1px dashed var(--border-subtle)",
        fontSize: "var(--text-2xs-size)",
        color: "var(--text-muted)",
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

function BarStatRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-xs-size)",
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
        <span data-tabular style={{ color: "var(--text-primary)", flexShrink: 0 }}>
          {value.toLocaleString()}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: "var(--r-sm)",
          background: "var(--bg-elevated)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: "var(--r-sm)",
            transition: "width 400ms var(--ease-out-expo)",
          }}
        />
      </div>
    </div>
  );
}

export function NetworkOverviewPanel({
  data,
  onGoToFollowersOverlaps,
  onGoToFollowingOneSided,
}: NetworkOverviewPanelProps) {
  const c = data.counts;
  const ratio = parseFollowerToConnectionRatio(data.ratios?.followerToConnection);
  const companies = (data.topCurrentCompanies ?? []).slice(0, 5);
  const overlap = (data.overlapSample ?? []).slice(0, 5);
  const oneSided = (data.oneSidedSample ?? []).slice(0, 5);

  const maxTri = Math.max(c.connections, c.followers, c.following, 1);
  const companyMax = Math.max(1, companies[0]?.count ?? 0);
  const topCompany = companies[0]?.company ?? "—";

  let ratioSentence = "—";
  if (ratio != null) {
    if (ratio >= 1) {
      ratioSentence = `${formatFollowerConnectionMultiplier(ratio)}× more followers than connections`;
    } else {
      ratioSentence = `${formatFollowerConnectionMultiplier(1 / ratio)}× more connections than followers`;
    }
  }

  const overlapExtra = Math.max(0, c.overlapSignals - 5);
  const oneSidedExtra = Math.max(0, c.oneSidedFollows - 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stat strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <StatCard label="Connections" value={c.connections} />
        <StatCard
          label="Followers"
          value={c.followers}
          delta={c.followersDelta != null ? c.followersDelta : undefined}
        />
        <StatCard label="Following" value={c.following} />
        <article
          style={{
            ...CARD,
            border: "1px dashed var(--amber-border)",
            boxShadow: "0 0 0 0px transparent",
            padding: "20px 24px",
          }}
          {...HOVER_CARD}
        >
          <div
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            Overlap signals
          </div>
          <div
            data-tabular
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-4xl-size)",
              lineHeight: "var(--text-4xl-line)",
              letterSpacing: "-0.04em",
              color: "var(--amber)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {c.overlapSignals.toLocaleString()}
          </div>
        </article>
      </div>

      {/* 2-col insight */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ ...CARD, padding: "16px 20px", display: "flex", flexDirection: "column", minHeight: 240 }} {...HOVER_CARD}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Follower ratio
          </div>
          <div
            style={{
              fontFamily: "var(--font-display-outfit)",
              fontWeight: 600,
              fontSize: "var(--text-md-size)",
              color: "var(--text-primary)",
              marginBottom: 12,
              lineHeight: 1.35,
            }}
          >
            {ratioSentence}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <BarStatRow label="Followers" value={c.followers} max={maxTri} color="var(--accent)" />
            <BarStatRow label="Connections" value={c.connections} max={maxTri} color="var(--green)" />
            <BarStatRow label="Following" value={c.following} max={maxTri} color="var(--amber)" />
          </div>
          <InsightFooter>Scaled to the largest of the three totals.</InsightFooter>
        </div>

        <div style={{ ...CARD, padding: "16px 20px", display: "flex", flexDirection: "column", minHeight: 240 }} {...HOVER_CARD}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Top current companies
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            {companies.map((co, idx) => (
              <BarStatRow
                key={`${co.company}-${idx}`}
                label={co.company}
                value={co.count}
                max={companyMax}
                color="var(--accent)"
              />
            ))}
            {companies.length === 0 && (
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)" }}>—</span>
            )}
          </div>
          <InsightFooter>
            {companies[0] ? `${topCompany} dominates your network` : "Company mix will appear once captured."}
          </InsightFooter>
        </div>
      </div>

      {/* 2-col */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 10,
        }}
      >
        <div
          style={{
            ...CARD,
            border: "1px dashed var(--amber-border)",
            background: "rgba(245, 166, 35, 0.06)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            minHeight: 260,
          }}
          {...HOVER_CARD}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Overlap signals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {overlap.map((row) => (
              <div
                key={row.profileUrl}
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <NetworkAvatar name={row.name} image={row.image ?? null} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display-outfit)",
                      fontWeight: 600,
                      fontSize: "var(--text-sm-size)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--text-2xs-size)",
                      color: "var(--text-muted)",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.headline ?? row.heading ?? "—"}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Badge label="Follow · connect" variant="amber" size="sm" />
                  </div>
                </div>
              </div>
            ))}
            {overlap.length === 0 && (
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)" }}>
                No overlap sample yet.
              </span>
            )}
          </div>
          <InsightFooter>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Highest-leverage outreach list.</span>
              <button
                type="button"
                onClick={onGoToFollowersOverlaps}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-2xs-size)",
                  color: "var(--accent)",
                  textAlign: "left",
                }}
              >
                + {overlapExtra} more · see Followers tab
              </button>
            </div>
          </InsightFooter>
        </div>

        <div style={{ ...CARD, padding: "16px 20px", display: "flex", flexDirection: "column", minHeight: 260 }} {...HOVER_CARD}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            One-sided follows
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {oneSided.map((row) => (
              <div
                key={row.profileUrl}
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <NetworkAvatar name={row.name} image={row.image ?? null} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display-outfit)",
                      fontWeight: 600,
                      fontSize: "var(--text-sm-size)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--text-2xs-size)",
                      color: "var(--text-muted)",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.headline ?? row.heading ?? "—"}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Badge label="You follow" variant="accent" size="sm" />
                  </div>
                </div>
              </div>
            ))}
            {oneSided.length === 0 && (
              <span style={{ fontFamily: "var(--font-data)", fontSize: 11, color: "var(--text-muted)" }}>
                No one-sided sample yet.
              </span>
            )}
          </div>
          <InsightFooter>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>{c.oneSidedFollows.toLocaleString()} one-sided follows</span>
              <button
                type="button"
                onClick={onGoToFollowingOneSided}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-2xs-size)",
                  color: "var(--accent)",
                  textAlign: "left",
                }}
              >
                + {oneSidedExtra} more · see Following tab
              </button>
            </div>
          </InsightFooter>
        </div>
      </div>
    </div>
  );
}
