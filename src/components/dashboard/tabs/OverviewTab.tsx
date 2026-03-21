"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronRight, X } from "lucide-react";
import {
  StatCard,
  DeltaBadge,
  DataCard,
  MetricRow,
  DonutChart,
  EmptyState,
  CaptureBadge,
  InsightCallout,
  SortButton,
  FreshnessTable,
  RefreshDataButton,
} from "@/components";
import type { FreshnessTableRow } from "@/components";
import type { MappedHomeData } from "@/lib/mappers/homeMapper";
import type { FreshnessStatus } from "@/components/FreshnessIndicator";
import { formatNumber, formatNumberIndian } from "@/lib/formatters";
import {
  staggerContainer,
  fadeUp,
  cardEntry,
  EASE_SLOW,
} from "@/lib/animations";

const FRESHNESS_LABELS: Record<string, string> = {
  // Profile
  profile_main: "My Profile",

  // Analytics / Posts · Impressions
  analytics_posts_impressions_7d: "Imp · 7D",
  analytics_posts_impressions_28d: "Imp · 28D",
  analytics_posts_impressions_90d: "Imp · 90D",

  // Analytics / Posts · Engagements
  analytics_posts_engagements_7d: "Eng · 7D",
  analytics_posts_engagements_28d: "Eng · 28D",
  analytics_posts_engagements_90d: "Eng · 90D",

  // Audience / Followers
  analytics_audience_7d: "Followers · 7D",
  analytics_audience_28d: "Followers · 28D",
  analytics_audience_90d: "Followers · 90D",

  // Audience / Demographics
  analytics_audience_demographics: "Audience · Demographics",

  // Appearances
  analytics_search_appearances_where: "Search · Where",
  analytics_search_appearances_companies: "Search · Companies",
  analytics_search_appearances_titles: "Search · Titles",
  analytics_search_appearances_found_for: "Search · Found For",

  // Profile Views
  analytics_profile_views: "Profile Viewers",

  // Network
  network_connections: "Connections",
  network_followers: "Followers",
  network_following: "Following",
};

const DUE_DAYS = 7;

const ALL_PAGE_TYPES = Object.keys(FRESHNESS_LABELS);

function getFreshnessStatus(capturedAt: string): FreshnessStatus {
  const then = new Date(capturedAt).getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - then) / (24 * 60 * 60 * 1000));
  if (daysSince < 5) return "fresh";
  if (daysSince <= DUE_DAYS) return "due";
  return "overdue";
}

function getDaysSince(capturedAt: string): number {
  const then = new Date(capturedAt).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (24 * 60 * 60 * 1000));
}

function formatClientId(clientId: string): string {
  return clientId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatLastCaptured(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface OverviewTabProps {
  data: MappedHomeData;
  clientId?: string;
  onRefresh?: () => void;
}

export function OverviewTab({ data, clientId = "", onRefresh }: OverviewTabProps) {
  const [engagementWindow, setEngagementWindow] = useState<"7d" | "28d" | "90d">("28d");
  const [topPostsSort, setTopPostsSort] = useState<"impressions" | "engagements" | "comments">("impressions");

  const apiProfileName = data.profile?.name;
  // If Home API doesn't provide a usable name (null/undefined/empty), keep the URL fallback.
  // Once the key becomes a non-empty string, we show the API value.
  const name =
    typeof apiProfileName === "string" && apiProfileName.trim() !== ""
      ? apiProfileName
      : formatClientId(clientId);
  const headline = data.profile?.headline ?? null;
  const lastCapturedStr = formatLastCaptured(data.lastCapturedAt);
  // Days since last capture: derived from external time; setState deferred to avoid sync setState-in-effect
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setNowMs(Date.now()), 0);
    return () => clearTimeout(id);
  }, [data.lastCapturedAt]);
  const lastCapturedDays =
    nowMs === null
      ? 0
      : Math.floor((nowMs - data.lastCapturedAt.getTime()) / (24 * 60 * 60 * 1000));
  const isStale = lastCapturedDays > 7;

  const freshnessItems = useMemo(() => {
    const withData = Object.entries(data.freshnessMap).map(([pageType, capturedAt]) => {
      const daysSince = getDaysSince(capturedAt);
      const status = getFreshnessStatus(capturedAt);
      const daysLate = status === "overdue" ? Math.max(0, daysSince - DUE_DAYS) : undefined;
      return {
        pageType,
        capturedAt,
        status,
        label: FRESHNESS_LABELS[pageType] ?? pageType,
        daysUntilDue: daysLate,
      };
    });
    const missing = ALL_PAGE_TYPES.filter((pt) => !(pt in data.freshnessMap)).map((pageType) => ({
      pageType,
      capturedAt: null as string | null,
      status: "missing" as const,
      label: FRESHNESS_LABELS[pageType] ?? pageType,
      daysUntilDue: undefined as number | undefined,
    }));
    const combined = [...withData, ...missing];
    const order = { overdue: 0, due: 1, fresh: 2, missing: 3 };
    return combined.sort((a, b) => order[a.status] - order[b.status]);
  }, [data.freshnessMap]);

  const freshnessSummary = useMemo(() => {
    const overdue = freshnessItems.filter((i) => i.status === "overdue").length;
    const due = freshnessItems.filter((i) => i.status === "due").length;
    const fresh = freshnessItems.filter((i) => i.status === "fresh").length;
    const missing = freshnessItems.filter((i) => i.status === "missing").length;
    return {
      overdue: overdue + due,
      fresh,
      missing,
    };
  }, [freshnessItems]);

  type FreshnessModalCategory = "overdue" | "fresh" | "missing" | "all";
  const [freshnessModalCategory, setFreshnessModalCategory] = useState<FreshnessModalCategory | null>(null);

  const freshnessModalItems = useMemo(() => {
    if (!freshnessModalCategory) return [];
    if (freshnessModalCategory === "all") return freshnessItems;
    if (freshnessModalCategory === "overdue")
      return freshnessItems.filter((i) => i.status === "overdue" || i.status === "due");
    if (freshnessModalCategory === "fresh") return freshnessItems.filter((i) => i.status === "fresh");
    if (freshnessModalCategory === "missing") return freshnessItems.filter((i) => i.status === "missing");
    return [];
  }, [freshnessModalCategory, freshnessItems]);

  const freshnessModalTitle =
    freshnessModalCategory === "overdue"
      ? "Overdue"
      : freshnessModalCategory === "fresh"
        ? "Fresh"
        : freshnessModalCategory === "missing"
          ? "Not captured"
          : "Capture status";

  const windowComparisonRows = [
    {
      label: "7 days",
      value: data.membersReached7d ?? 0,
      members: data.membersReached7d,
      null: !data.membersReached7d,
    },
    {
      label: "28 days",
      value: data.membersReached28d ?? 0,
      members: data.membersReached28d,
      null: !data.membersReached28d,
    },
    {
      label: "90 days",
      value: data.membersReached90d ?? 0,
      members: data.membersReached90d,
      null: !data.membersReached90d,
    },
  ];

  const safeMaxImp =
    windowComparisonRows.reduce<number>((max, row) => {
      const numericValue =
        typeof row.value === "number" ? row.value : Number(row.value) || 0;
      return numericValue > max ? numericValue : max;
    }, 0) || 1;

  const engagementSource =
    engagementWindow === "7d"
      ? data.engagements7d
      : engagementWindow === "90d"
        ? data.engagements90d
        : data.engagements28d;
  const engagementSplit =
    engagementWindow === "7d"
      ? data.engagementsSplit7d
      : engagementWindow === "90d"
        ? data.engagementsSplit90d
        : data.engagementsSplit28d;

  const sortedTopPosts = useMemo(() => {
    return [...data.topPosts].sort((a, b) => {
      if (topPostsSort === "impressions") return b.impressions - a.impressions;
      if (topPostsSort === "engagements") return b.engagements - a.engagements;
      return (b.comments ?? 0) - (a.comments ?? 0);
    });
  }, [data.topPosts, topPostsSort]);

  const audienceInsightText = useMemo(() => {
    const ins = data.audienceInsights;
    if (!ins?.experience?.name || !ins?.industry?.name || !ins?.location?.name) return null;
    return `${ins.experience.name}-level ${ins.industry.name} professionals in ${ins.location.name} are your core audience`;
  }, [data.audienceInsights]);

  const searchInsightText = useMemo(() => {
    const top2 = data.search?.topTitles.slice(0, 2).map((t) => t.label) ?? [];
    if (top2.length === 0) return null;
    return `${top2.join(" and ")} are your top searchers`;
  }, [data.search]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Section 1 — Header meta */}
      <motion.div
        variants={fadeUp}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-xl-size)",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {name}
          </h1>
          {headline && (
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-sm-size)",
                color: "var(--text-muted)",
                margin: "4px 0 0",
              }}
            >
              {headline}
            </p>
          )}
          {!onRefresh && (
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: isStale ? "var(--amber)" : "var(--text-muted)",
                margin: "8px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isStale && <AlertTriangle size={12} />}
              Last captured {lastCapturedStr}
            </p>
          )}
        </div>
        {onRefresh && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <RefreshDataButton onClick={onRefresh} align="flex-end" />

            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: isStale ? "var(--amber)" : "var(--text-muted)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isStale && <AlertTriangle size={12} />}
              Last captured {lastCapturedStr}
            </p>
          </div>
        )}
      </motion.div>

      {/* Section 2 — Freshness summary pills + expand modal */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFreshnessModalCategory("overdue")}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 transition-colors hover:opacity-90"
          style={{
            background: "var(--red-dim)",
            borderColor: "var(--red-border)",
            color: "var(--red)",
          }}
        >
          <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-(--red)" />
          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", fontWeight: 500 }}>
            Overdue
          </span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", fontVariantNumeric: "tabular-nums" }}>
            {freshnessSummary.overdue}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFreshnessModalCategory("fresh")}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 transition-colors hover:opacity-90"
          style={{
            background: "var(--green-muted)",
            borderColor: "var(--green-border)",
            color: "var(--green)",
          }}
        >
          <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-(--green)" />
          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", fontWeight: 500 }}>
            Fresh
          </span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", fontVariantNumeric: "tabular-nums" }}>
            {freshnessSummary.fresh}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFreshnessModalCategory("missing")}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 transition-colors hover:opacity-90"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-(--text-disabled)" />
          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", fontWeight: 500 }}>
            Not captured
          </span>
          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", fontVariantNumeric: "tabular-nums" }}>
            {freshnessSummary.missing}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFreshnessModalCategory("all")}
          aria-label="View all capture status"
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-(--border-subtle) bg-transparent px-3 py-3 text-(--text-muted) transition-colors hover:bg-(--bg-elevated) hover:text-(--text-primary)"
        >
          <ChevronRight size={18} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)" }}>
            View all
          </span>
        </button>
      </motion.div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {freshnessModalCategory !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                style={{ background: "rgba(0,0,0,0.25)" }}
                onClick={() => setFreshnessModalCategory(null)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="freshness-modal-title"
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-xl shadow-xl"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="flex items-center justify-between border-b px-6 py-5"
                    style={{ borderColor: "var(--border-default)" }}
                  >
                    <h2
                      id="freshness-modal-title"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "var(--text-xl-size)",
                        lineHeight: "var(--text-xl-line)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {freshnessModalTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setFreshnessModalCategory(null)}
                      aria-label="Close"
                      className="rounded p-2 text-(--text-muted) transition-colors hover:bg-(--bg-elevated) hover:text-(--text-primary)"
                    >
                      <X size={22} />
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6">
                    <FreshnessTable
                      items={freshnessModalItems.map(
                        (item): FreshnessTableRow => ({
                          id: item.pageType,
                          label: item.label,
                          status: item.status,
                          capturedAt: item.capturedAt,
                          daysUntilDue: item.daysUntilDue,
                        })
                      )}
                      size="md"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Section 3 — KPI cards: row 1 Imp 7/28/90, row 2 Eng 7/28/90, row 3 Followers 7/28/90 */}
      <motion.div variants={staggerContainer} className="flex flex-col gap-4">
        {[
          {
            category: "Impressions",
            cadenceLabel: "Impressions",
            row: [
              { stat: data.impressions7d, cadence: "7 days" },
              { stat: data.impressions28d, cadence: "28 days" },
              { stat: data.impressions90d, cadence: "90 days" },
            ],
          },
          {
            category: "Engagements",
            cadenceLabel: "Engagements",
            row: [
              { stat: data.engagements7d, cadence: "7 days" },
              { stat: data.engagements28d, cadence: "28 days" },
              { stat: data.engagements90d, cadence: "90 days" },
            ],
          },
          {
            category: "Followers",
            cadenceLabel: "Followers",
            row: [
              { stat: data.followers7d, cadence: "7 days" },
              { stat: data.followers28d, cadence: "28 days" },
              { stat: data.followers90d, cadence: "90 days" },
            ],
          },
        ].map(({ category, cadenceLabel, row }, rowIndex) => {
          const isFollowers = category === "Followers";

          if (isFollowers) {
            return (
              <div
                key={rowIndex}
                style={{ display: "flex", flexDirection: "column", gap: 6 }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-2xs-size)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Followers
                </div>
                <motion.div
                  variants={staggerContainer}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <motion.div variants={cardEntry} className="sm:col-span-2 lg:col-span-1">
                    {data.followers ? (
                      <StatCard
                        label="Followers · total"
                        value={data.followers.display}
                        delta={
                          data.followers.direction === "up"
                            ? (data.followers.deltaNumeric ?? 0)
                            : data.followers.direction === "down"
                              ? -(data.followers.deltaNumeric ?? 0)
                              : data.followers.deltaNumeric ?? undefined
                        }
                      />
                    ) : (
                      <article
                        style={{
                          background: "var(--bg-card)",
                          border: "1px dashed var(--border-subtle)",
                          boxShadow: "0 0 0 0px transparent",
                          borderRadius: "var(--r-md)",
                          padding: "20px 24px",
                          minHeight: 120,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-data)",
                            fontSize: "var(--text-xs-size)",
                            lineHeight: "var(--text-xs-line)",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "var(--text-muted)",
                            marginBottom: "4px",
                          }}
                        >
                          followers · total
                        </div>
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            minHeight: 44,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-data)",
                              fontSize: "var(--text-sm-size)",
                              lineHeight: "var(--text-sm-line)",
                              color: "var(--text-disabled)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            No data
                          </span>
                        </div>
                        <div style={{ marginTop: "8px", minHeight: 24 }} />
                      </article>
                    )}
                  </motion.div>

                  {row.map((item, i) => (
                    <motion.div key={i} variants={cardEntry}>
                      {item.stat ? (
                        <StatCard
                          label={item.cadence}
                          value={item.stat.delta ?? "—"}
                          delta={
                            item.stat.direction === "up"
                              ? (item.stat.deltaNumeric ?? 0)
                              : item.stat.direction === "down"
                                ? -(item.stat.deltaNumeric ?? 0)
                                : item.stat.deltaNumeric ?? undefined
                          }
                        />
                      ) : (
                        <article
                          style={{
                            background: "var(--bg-card)",
                            border: "1px dashed var(--border-subtle)",
                            boxShadow: "0 0 0 0px transparent",
                            borderRadius: "var(--r-md)",
                            padding: "20px 24px",
                            minHeight: 120,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-data)",
                              fontSize: "var(--text-xs-size)",
                              lineHeight: "var(--text-xs-line)",
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              color: "var(--text-muted)",
                              marginBottom: "4px",
                            }}
                          >
                            {`followers · ${item.cadence}`}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              minHeight: 44,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-data)",
                                fontSize: "var(--text-sm-size)",
                                lineHeight: "var(--text-sm-line)",
                                color: "var(--text-disabled)",
                                letterSpacing: "0.02em",
                              }}
                            >
                              No data
                            </span>
                          </div>
                          <div style={{ marginTop: "8px", minHeight: 24 }} />
                        </article>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            );
          }

          return (
            <div
              key={rowIndex}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <div
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-2xs-size)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                {category}
              </div>
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                {row.map((item, i) => (
                  <motion.div key={i} variants={cardEntry}>
                    {item.stat ? (
                      <StatCard
                        label={`${cadenceLabel} · ${item.cadence}`}
                        value={item.stat.display}
                        delta={
                          item.stat.direction === "up"
                            ? (item.stat.deltaNumeric ?? 0)
                            : item.stat.direction === "down"
                              ? -(item.stat.deltaNumeric ?? 0)
                              : item.stat.deltaNumeric ?? undefined
                        }
                      />
                    ) : (
                      <article
                        style={{
                          background: "var(--bg-card)",
                          border: "1px dashed var(--border-subtle)",
                          boxShadow: "0 0 0 0px transparent",
                          borderRadius: "var(--r-md)",
                          padding: "20px 24px",
                          minHeight: 120,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-data)",
                            fontSize: "var(--text-xs-size)",
                            lineHeight: "var(--text-xs-line)",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "var(--text-muted)",
                            marginBottom: "4px",
                          }}
                        >
                          {`${cadenceLabel.toLowerCase()} · ${item.cadence}`}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            minHeight: 44,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-data)",
                              fontSize: "var(--text-sm-size)",
                              lineHeight: "var(--text-sm-line)",
                              color: "var(--text-disabled)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            No data
                          </span>
                        </div>
                        <div style={{ marginTop: "8px", minHeight: 24 }} />
                      </article>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Section 4 — One row, 3 cols (40% | 20% | 40%), same height */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_2fr] lg:items-stretch"
      >
        {/* Col 1 — Donut chart (Engagement breakdown) — 40% */}
        <motion.div variants={cardEntry} className="min-h-0 flex flex-col">
          <DataCard
            title="Engagement breakdown"
            action={
              <div style={{ display: "flex", gap: 4 }}>
                {(["7d", "28d", "90d"] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setEngagementWindow(w)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "var(--r-sm)",
                      border: "1px dashed var(--border-subtle)",
                      background: engagementWindow === w ? "var(--accent-dim)" : "transparent",
                      color: engagementWindow === w ? "var(--accent)" : "var(--text-muted)",
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--text-2xs-size)",
                      cursor: "pointer",
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            }
            className="min-h-0"
            fillHeight
          >
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                flex: 1,
                minHeight: 0,
              }}
            >
              {engagementSource && engagementSplit && engagementSplit.length > 0 ? (
                <DonutChart
                  key={engagementWindow}
                  data={(() => {
                    const total = engagementSplit.reduce((s, d) => s + d.value, 0);
                    return engagementSplit.filter((d) => {
                      if (d.value <= 0) return false;
                      const pct = total > 0 ? (d.value / total) * 100 : 0;
                      return Math.round(pct) > 0;
                    });
                  })()}
                  centerValue={engagementSource.display}
                  centerLabel={`${engagementWindow} days`}
                  size={160}
                  strokeWidth={18}
                />
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-sm-size)",
                    color: "var(--text-muted)",
                  }}
                >
                  Not captured
                </p>
              )}
            </div>
          </DataCard>
        </motion.div>

        {/* Col 2 — Link clicks vertical bar chart — 20% */}
        <motion.div variants={cardEntry} className="min-h-0 flex flex-col">
          <DataCard title="Link clicks" className="min-h-0" fillHeight>
            <div
              style={{
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minHeight: 200,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: 20,
                  width: "100%",
                  maxWidth: 160,
                }}
              >
                {[
                  { label: "7d", value: data.linkClicks7d },
                  { label: "28d", value: data.linkClicks28d },
                  { label: "90d", value: data.linkClicks90d },
                ].map(({ label, value }) => {
                  const maxClicks = Math.max(
                    data.linkClicks7d ?? 0,
                    data.linkClicks28d ?? 0,
                    data.linkClicks90d ?? 0,
                    1,
                  );
                  const num = value ?? 0;
                  const pct = maxClicks > 0 ? (num / maxClicks) * 100 : 0;
                  return (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-sm-size)",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {value != null ? formatNumberIndian(value) : "0"}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 44,
                          height: 100,
                          borderRadius: "var(--r-md)",
                          background: "var(--bg-elevated)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "flex-end",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(0, pct)}%` }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            width: "100%",
                            borderRadius: "var(--r-sm)",
                            background: num > 0 ? "var(--accent)" : "var(--border-subtle)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-2xs-size)",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </DataCard>
        </motion.div>

        {/* Col 3 — Members reached — 40% */}
        <motion.div variants={fadeUp} className="min-h-0 flex flex-col">
          <DataCard
            title="Members reached"
            className="min-h-0"
            fillHeight
          >
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16, flex: 1, minHeight: 0 }}>
            {windowComparisonRows.map((row, index) => (
              <div
                key={row.label}
                style={{
                  opacity: row.null ? 0.4 : 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--text-sm-size)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-sm-size)",
                        color: "var(--text-primary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.members != null ? formatNumberIndian(row.members) : "—"}
                    </span>
                  </div>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      safeMaxImp > 0
                        ? ((typeof row.value === "number"
                            ? row.value
                            : Number(row.value) || 0) /
                            safeMaxImp) *
                          100
                        : 0
                    }%`,
                  }}
                  transition={{ ...EASE_SLOW, delay: index * 0.1 }}
                  style={{
                    height: 3,
                    borderRadius: "var(--r-sm)",
                    background: "var(--accent)",
                  }}
                />
                {row.members && (
                  <span
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--text-xs-size)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {row.members} members reached
                  </span>
                )}
              </div>
            ))}
          </div>
          </DataCard>
        </motion.div>
      </motion.div>

      {/* Section 5 — Left: Audience + Top posts stacked; Right: Who's finding you (same column height) */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <div className="flex min-h-0 flex-col gap-4">
          <motion.div variants={cardEntry}>
            <DataCard title="Audience">
            {!data.followers && !data.audienceInsights ? (
              <div style={{ padding: 16 }}>
                <CaptureBadge pageType="audience" status="missing" />
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-sm-size)",
                    color: "var(--text-muted)",
                    marginTop: 8,
                  }}
                >
                  Capture audience data to unlock this section
                </p>
              </div>
            ) : (
              <div style={{ padding: 16 }}>
                {data.followers && (
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-2xl-size)",
                        color: "var(--text-primary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {data.followers.display}
                    </div>
                    {data.followers.delta != null && (
                      <div style={{ marginTop: 6 }}>
                        <DeltaBadge
                          value={
                            data.followers.direction === "up"
                              ? (data.followers.deltaNumeric ?? 0)
                              : data.followers.direction === "down"
                                ? -(data.followers.deltaNumeric ?? 0)
                                : 0
                          }
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                )}
                {data.audienceInsights && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        data.audienceInsights.experience,
                        data.audienceInsights.location,
                        data.audienceInsights.industry,
                      ]
                        .filter(Boolean)
                        .map((ins, i) =>
                          ins ? (
                            <MetricRow
                              key={i}
                              label={ins.name}
                              value={ins.percentage}
                              displayValue={`${ins.percentage}%`}
                              maxValue={100}
                              percentage={ins.percentage}
                              index={i}
                            />
                          ) : null,
                        )}
                    </div>
                    {audienceInsightText && (
                      <div style={{ marginTop: 12 }}>
                        <InsightCallout text={audienceInsightText} type="info" />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </DataCard>
          </motion.div>

          <motion.div variants={cardEntry} className="min-h-0 flex flex-1 flex-col">
            <DataCard title="Top posts" description="from impressions · 28d" className="min-h-0" fillHeight>
              {data.topPosts.length === 0 ? (
                <div style={{ padding: 16 }}>
                  <EmptyState variant="filtered-empty" title="No posts captured yet" />
                </div>
              ) : (
                <div style={{ padding: "0 16px 16px", width: "100%", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px dashed var(--border-subtle)", width: 32 }}>#</th>
                        <th style={{ textAlign: "left", padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px dashed var(--border-subtle)", width: "40%" }}>Post</th>
                        <th style={{ textAlign: "right", padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px dashed var(--border-subtle)" }}>
                          <SortButton active={topPostsSort === "impressions"} direction="desc" onClick={() => setTopPostsSort("impressions")}>Impr</SortButton>
                        </th>
                        <th style={{ textAlign: "right", padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px dashed var(--border-subtle)" }}>
                          <SortButton active={topPostsSort === "engagements"} direction="desc" onClick={() => setTopPostsSort("engagements")}>Eng</SortButton>
                        </th>
                        <th style={{ textAlign: "right", padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px dashed var(--border-subtle)" }}>
                          <SortButton active={topPostsSort === "comments"} direction="desc" onClick={() => setTopPostsSort("comments")}>Cmt</SortButton>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTopPosts.slice(0, 10).map((post, i) => (
                        <tr key={`${post.impressions}-${i}`} style={{ borderBottom: "1px dashed var(--border-subtle)", transition: "background 100ms ease" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", width: 32, verticalAlign: "top" }}>{i + 1}</td>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-primary)", maxWidth: 280, overflow: "hidden", verticalAlign: "top" }}>
                            <span
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical" as const,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.4,
                                minWidth: 0,
                                maxWidth: "100%",
                              }}
                            >
                              {post.description}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", textAlign: "right", verticalAlign: "top" }}>
                            <span style={{ marginRight: 6 }}>{formatNumber(post.impressions)}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: post.deltaColor === "up" ? "var(--green)" : post.deltaColor === "down" ? "var(--red)" : "var(--text-muted)" }}>
                              {post.deltaColor === "up" ? "↑" : post.deltaColor === "down" ? "↓" : "—"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", textAlign: "right", verticalAlign: "top" }}>{post.engagements}</td>
                          <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", textAlign: "right", verticalAlign: "top" }}>{post.comments != null ? post.comments : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DataCard>
          </motion.div>
        </div>

        <motion.div variants={cardEntry} className="min-h-0 flex flex-1 flex-col">
          <DataCard title="Who's finding you" className="min-h-0" fillHeight>
            {!data.search ? (
              <div style={{ padding: 24 }}>
                <CaptureBadge pageType="search" status="missing" />
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-sm-size)",
                    color: "var(--text-muted)",
                    marginTop: 12,
                  }}
                >
                  Capture search appearances to unlock
                </p>
              </div>
            ) : (
              <div style={{ padding: 16 }}>
                {data.search.totalAppearances != null && (
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-2xl-size)",
                        color: "var(--text-primary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatNumber(data.search.totalAppearances)}
                    </span>
                    {data.search.delta && (
                      <span style={{ marginLeft: 10, display: "inline-flex", verticalAlign: "middle" }}>
                        <DeltaBadge
                          size="sm"
                          value={(() => {
                            const n = Number(String(data.search.delta).replace(/,/g, "").trim());
                            return Number.isFinite(n) ? n : 0;
                          })()}
                        />
                      </span>
                    )}
                  </div>
                )}
                {[
                  { title: "Searcher titles", items: data.search.topTitles.slice(0, 5), showBar: true as const },
                  { title: "Searcher companies", items: data.search.topCompanies.slice(0, 5), showBar: false as const },
                  { title: "You appear for", items: data.search.foundFor.slice(0, 5), showBar: true as const },
                ].map((section, sectionIndex) => {
                  const total = section.items.reduce((s, x) => s + x.value, 0) || 1;
                  const isFirst = sectionIndex === 0;
                  return (
                    <div
                      key={section.title}
                      style={{
                        marginBottom: 28,
                        marginTop: isFirst ? 4 : 16,
                        paddingTop: isFirst ? 4 : 16,
                        borderTop: isFirst ? "none" : "1px dashed var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-2xs-size)",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        {section.title}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {section.showBar
                          ? section.items.map((item, i) => (
                              <MetricRow
                                key={i}
                                label={item.label}
                                value={item.value}
                                displayValue={item.displayValue ?? `${item.value}%`}
                                maxValue={total}
                                index={i}
                              />
                            ))
                          : section.items.map((item, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  fontFamily: "var(--font-data)",
                                  fontSize: "var(--text-sm-size)",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {item.image && (
                                  // Small list avatars; next/image remote patterns would require host allowlist.
                                  // eslint-disable-next-line @next/next/no-img-element -- dynamic external URLs
                                  <img
                                    src={item.image}
                                    alt={item.label}
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 4,
                                      objectFit: "cover",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <span>{item.label}</span>
                              </div>
                            ))}
                      </div>
                    </div>
                  );
                })}
                {searchInsightText && (
                  <InsightCallout text={searchInsightText} type="growth" />
                )}
              </div>
            )}
          </DataCard>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
