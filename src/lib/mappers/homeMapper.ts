import { formatNumber, formatNumberIndian } from "@/lib/formatters";
import type {
  EngagementsSplit,
  EngagementsSummary,
  HomeData,
  HistoricalImpressions,
  ImpressionsFullData,
  ImpressionsSummary,
  FreshnessMap,
  ProfileData,
  ProfileViewsData,
  SearchData,
  SearchAppearancesSummary,
  TopPost,
  Viewer,
} from "@/types/home";

// ── Mapped types (exported for consumers) ─────────────

export type MappedStat = {
  value: number | null;
  display: string;
  delta: string | null;
  deltaNumeric: number | null;
  direction: "up" | "down" | "neutral";
};

export type MappedTopPost = {
  description: string;
  impressions: number;
  engagements: number;
  comments: number | null;
  deltaLabel: string;
  deltaColor: "up" | "down" | "neutral";
};

export type MappedHomeData = {
  lastCapturedAt: Date;
  hasAnyData: boolean;
  captureCount: number;
  freshnessMap: FreshnessMap;

  impressions7d: MappedStat | null;
  impressions28d: MappedStat | null;
  impressions90d: MappedStat | null;
  engagements7d: MappedStat | null;
  engagements28d: MappedStat | null;
  engagements90d: MappedStat | null;
  followers: MappedStat | null;
  followers7d: MappedStat | null;
  followers28d: MappedStat | null;
  followers90d: MappedStat | null;
  linkClicks7d: number | null;
  linkClicks28d: number | null;
  linkClicks90d: number | null;
  membersReached7d: number | null;
  membersReached28d: number | null;
  membersReached90d: number | null;
  engagementsSplit7d: { label: string; value: number; color: string }[] | null;
  engagementsSplit28d: { label: string; value: number; color: string }[] | null;
  engagementsSplit90d: { label: string; value: number; color: string }[] | null;
  profileViews: MappedStat | null;
  searchAppearances: MappedStat | null;

  profile: {
    name: string;
    headline: string;
    location: string;
    company: string;
    followers: number | null;
    connections: number | null;
  } | null;

  audienceInsights: {
    experience: { name: string; percentage: number } | null;
    location: { name: string; percentage: number } | null;
    industry: { name: string; percentage: number } | null;
  } | null;

  search: {
    totalAppearances: number | null;
    delta: string | null;
    direction: "up" | "down" | "neutral";
    whereYouAppeared: {
      posts: number;
      networkRecommendations: number;
      comments: number;
      search: number;
    } | null;
    topCompanies: { label: string; value: number; displayValue?: string }[];
    topTitles: { label: string; value: number; displayValue?: string }[];
    foundFor: { label: string; value: number; displayValue?: string }[];
  } | null;

  viewers: {
    total: number | null;
    delta: string | null;
    direction: "up" | "down" | "neutral";
    list: Viewer[];
  } | null;

  topPosts: MappedTopPost[];

  historicalImpressions: {
    imp7d: {
      total: number | null;
      delta: string | null;
      direction: "up" | "down" | "neutral";
    } | null;
    imp90d: {
      total: number | null;
      delta: string | null;
      direction: "up" | "down" | "neutral";
    } | null;
  };
};

// ── Internal helpers ────────────────────────────────

function parseNum(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  const n = Number(val.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Display for KPI cards: exact value with Indian comma separation (no K/M rounding). */
function fmt(val: number | null): string {
  return formatNumberIndian(val);
}

function toDirection(
  color: "green" | "red" | null | undefined,
): "up" | "down" | "neutral" {
  if (color === "green") return "up";
  if (color === "red") return "down";
  return "neutral";
}

function parsePct(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  const s = val.replace(/%/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Parse percentage string; for "< 1%" returns { value: 0.5, displayValue: "< 1%" } so UX shows label instead of 0. */
function parsePctWithDisplay(
  val: string | null | undefined,
): { value: number; displayValue?: string } {
  if (val == null || val === "") return { value: 0 };
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "< 1%" || lower === "<1%" || lower.startsWith("< 1") || lower.startsWith("<1"))
    return { value: 0.5, displayValue: "< 1%" };
  const n = parsePct(trimmed);
  return { value: n ?? 0 };
}

function parseDeltaNumeric(change: string | number | null | undefined): number | null {
  if (change == null || change === "") return null;
  if (typeof change === "number") return Number.isFinite(change) ? change : null;
  const n = parseFloat(change.replace(/,/g, "").replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function buildDelta(
  change: string | null | undefined,
  color: "green" | "red" | null | undefined,
): string | null {
  if (change == null || change === "") return null;
  const prefix = color === "green" ? "↑ " : color === "red" ? "↓ " : "";
  return `${prefix}${change}`;
}

function toStat(
  rawValue: string | null | undefined,
  deltaChange: string | null | undefined,
  deltaColor: "green" | "red" | null | undefined,
): MappedStat | null {
  const value = parseNum(rawValue ?? null);
  return {
    value,
    display: fmt(value),
    delta: buildDelta(deltaChange, deltaColor),
    deltaNumeric: parseDeltaNumeric(deltaChange),
    direction: toDirection(deltaColor),
  };
}

function parseComments(val: string): number | null {
  if (val === "" || val == null) return null;
  return parseNum(val);
}

function mapTopPosts(posts: TopPost[] | undefined): MappedTopPost[] {
  if (!posts?.length) return [];
  return posts.map((p) => ({
    description: p.postDescription,
    impressions: parseNum(p.impressionsStat) ?? 0,
    engagements: parseNum(p.engagementsCount) ?? 0,
    comments: parseComments(p.commentsCount),
    deltaLabel: p.impressionDeltaLabel,
    deltaColor:
      p.impressionDeltaColor === "green"
        ? "up"
        : p.impressionDeltaColor === "red"
          ? "down"
          : "neutral",
  }));
}

// ── Main mapper ─────────────────────────────────────

export function mapHomeData(raw: HomeData): MappedHomeData {
  const summary = raw.summary;
  const freshnessData = raw.freshnessData ?? [];
  const historicalImpressions = raw.historicalImpressions ?? ({} as HistoricalImpressions);

  const freshnessMap: FreshnessMap = freshnessData.reduce<FreshnessMap>(
    (acc, doc) => {
      acc[doc.pageType] = doc.capturedAt;
      return acc;
    },
    {},
  );

  const captureCount = freshnessData.length;

  const hasAnyData =
    summary.profile != null ||
    summary.impressions7d != null ||
    summary.impressions28d != null ||
    summary.impressions90d != null ||
    summary.engagements28d != null ||
    summary.audience != null ||
    summary.search != null ||
    summary.profileViews != null;

  const imp = (s: typeof summary.impressions7d) =>
    s
      ? toStat(
          (s as { impressions?: { totalImpression: string } }).impressions?.totalImpression ?? (s as ImpressionsSummary).totalImpression,
          (s as { impressions?: { deltaChange: string | null; deltaColor: "green" | "red" | null } }).impressions?.deltaChange ?? (s as ImpressionsSummary).deltaChange,
          (s as { impressions?: { deltaColor: "green" | "red" | null } }).impressions?.deltaColor ?? (s as ImpressionsSummary).deltaColor,
        )
      : null;

  const impressions7d = imp(summary.impressions7d);
  const impressions28d = imp(summary.impressions28d);
  const impressions90d = imp(summary.impressions90d);

  const eng = (s: typeof summary.engagements28d) => {
    if (!s) return null;
    const nested = (s as { engagements?: { totalEngagements: string; deltaChange: string | null; deltaColor: "green" | "red" | null } }).engagements;
    const e = nested ?? (s as EngagementsSummary);
    return toStat(e.totalEngagements, e.deltaChange, e.deltaColor);
  };

  const engagements7d = eng(summary.engagements7d ?? null);
  const engagements28d = eng(summary.engagements28d);
  const engagements90d = eng(summary.engagements90d ?? null);

  const primaryAudience = summary.audience7d ?? summary.audience;
  const followers = primaryAudience?.followers
    ? toStat(
        primaryAudience.followers.totalFollowers,
        primaryAudience.followers.deltaChange,
        primaryAudience.followers.deltaColor,
      )
    : null;

  const fol = (a: typeof summary.audience7d) =>
    a?.followers
      ? toStat(a.followers.totalFollowers, a.followers.deltaChange, a.followers.deltaColor)
      : null;
  const followers7d = fol(summary.audience7d ?? null);
  const followers28d = fol(summary.audience28d ?? null);
  const followers90d = fol(summary.audience90d ?? null);

  const profileViews = summary.profileViews
    ? toStat(
        summary.profileViews.totalViews,
        summary.profileViews.delta,
        null,
      )
    : null;

  const searchAppearances = summary.search
    ? (() => {
        const s = summary.search as
          | SearchData
          | SearchAppearancesSummary
          | (SearchData & { where?: SearchAppearancesSummary["where"] });
        const total =
          (s as SearchData).totalAppearances ??
          (s as SearchAppearancesSummary).where?.totalAppearances ??
          null;
        const delta =
          (s as SearchData).delta ??
          (s as SearchAppearancesSummary).where?.delta ??
          null;
        return toStat(
          total != null ? String(total) : null,
          delta != null ? String(delta) : null,
          null,
        );
      })()
    : null;

  let profile: MappedHomeData["profile"] = null;
  if (summary.profile) {
    const p = summary.profile as ProfileData;
    profile = {
      name: p.name,
      headline: p.headline,
      location: p.location,
      company: p.company,
      followers: parseNum(p.followers),
      connections: parseNum(p.connections),
    };
  }

  let audienceInsights: MappedHomeData["audienceInsights"] = null;
  const audienceForInsights = summary.audience ?? summary.audience7d;
  // API may send insights under audience.insights or at summary level as summary.insights
  const rawInsights =
    audienceForInsights?.insights ??
    (summary as Record<string, unknown>).insights;
  if (rawInsights) {
    const i = rawInsights as Record<string, unknown>;
    // Shape 1: { experience: { name, percentage }, location, industry }
    const hasObjectShape =
      i.experience && typeof i.experience === "object" && "name" in i.experience;
    if (hasObjectShape) {
      const exp = i.experience as { name: string; percentage: string };
      const loc = i.location as { name: string; percentage: string } | undefined;
      const ind = i.industry as { name: string; percentage: string } | undefined;
      audienceInsights = {
        experience: exp
          ? { name: exp.name, percentage: parsePct(exp.percentage) ?? 0 }
          : null,
        location: loc
          ? { name: loc.name, percentage: parsePct(loc.percentage) ?? 0 }
          : null,
        industry: ind
          ? { name: ind.name, percentage: parsePct(ind.percentage) ?? 0 }
          : null,
      };
    } else {
      // Shape 2: arrays e.g. { seniority: [{ title, percentage }], location: [...], industry: [...] }
      const first = (arr: { title: string; percentage: string }[] | undefined) =>
        arr?.[0]
          ? {
              name: arr[0].title,
              percentage: parsePct(arr[0].percentage) ?? 0,
            }
          : null;
      const seniority = i.seniority as { title: string; percentage: string }[] | undefined;
      const location = i.location as { title: string; percentage: string }[] | undefined;
      const industry = i.industry as { title: string; percentage: string }[] | undefined;
      audienceInsights = {
        experience: first(seniority),
        location: first(location),
        industry: first(industry),
      };
    }
  }

  let search: MappedHomeData["search"] = null;
  const rawSearch = summary.search as Record<string, unknown> | null | undefined;
  if (rawSearch) {
    try {
      const s = rawSearch;
      const hasNewShape = "where" in s;
      const hasStandardShape =
        Array.isArray((s as SearchData).topSearcherTitles) ||
        Array.isArray((s as SearchData).topSearcherCompanies);
      const hasArrayShape =
        Array.isArray((s as { job_title?: unknown }).job_title) ||
        Array.isArray((s as { company?: unknown }).company);

      if (hasNewShape) {
        const ns = rawSearch as SearchAppearancesSummary;
        const where = ns.where;
        const deltaRaw = where?.delta ?? null;
        let deltaDirectionColor: "green" | "red" | null = null;
        if (typeof deltaRaw === "number") {
          if (deltaRaw > 0) deltaDirectionColor = "green";
          else if (deltaRaw < 0) deltaDirectionColor = "red";
        } else if (typeof deltaRaw === "string" && deltaRaw.trim() !== "") {
          deltaDirectionColor = deltaRaw.trim().startsWith("-") ? "red" : "green";
        }

        const whereBlock = where?.whereYouAppeared;

        const toPercentItems = (
          arr: { title: string; percentage: number }[] | undefined,
        ) =>
          (arr ?? []).map((x) => ({
            label: x.title,
            value: x.percentage,
            displayValue: `${x.percentage}%`,
          }));

        search = {
          totalAppearances: parseNum(where?.totalAppearances ?? null),
          delta: deltaRaw != null ? String(deltaRaw) : null,
          direction: toDirection(deltaDirectionColor),
          whereYouAppeared: whereBlock
            ? {
                posts: parseNum(whereBlock.posts) ?? 0,
                networkRecommendations:
                  parseNum(whereBlock.networkRecommendations) ?? 0,
                comments: parseNum(whereBlock.comments) ?? 0,
                search: parseNum(whereBlock.search) ?? 0,
              }
            : null,
          topCompanies: (ns.companies ?? []).map((c) => ({
            label: c.label,
            value: 0,
          })),
          topTitles: toPercentItems(ns.titles),
          foundFor: toPercentItems(ns.foundFor),
        };
      } else if (hasStandardShape) {
        const std = rawSearch as SearchData & { delta?: string | number | null };
        const where = std.whereYouAppeared;

        const deltaRaw = std.delta;
        let deltaDirectionColor: "green" | "red" | null = null;
        if (typeof deltaRaw === "number") {
          if (deltaRaw > 0) deltaDirectionColor = "green";
          else if (deltaRaw < 0) deltaDirectionColor = "red";
        } else if (typeof deltaRaw === "string" && deltaRaw.trim() !== "") {
          deltaDirectionColor = deltaRaw.trim().startsWith("-") ? "red" : "green";
        }

        search = {
          totalAppearances: parseNum(std.totalAppearances),
          delta: deltaRaw != null ? String(deltaRaw) : null,
          direction: toDirection(deltaDirectionColor),
          whereYouAppeared: where
            ? {
                posts: parseNum(where.posts) ?? 0,
                networkRecommendations: parseNum(where.networkRecommendations) ?? 0,
                comments: parseNum(where.comments) ?? 0,
                search: parseNum(where.search) ?? 0,
              }
            : null,
          topCompanies: (std.topSearcherCompanies ?? []).map((x) => ({
            label: x.label,
            value: parseNum(x.value) ?? 0,
          })),
          topTitles: (std.topSearcherTitles ?? []).map((x) => ({
            label: x.label,
            value: parseNum(x.value) ?? 0,
          })),
          foundFor: (std.titlesFoundFor ?? []).map((x) => ({
            label: x.label,
            value: parseNum(x.value) ?? 0,
          })),
        };
      } else if (hasArrayShape) {
        // Alternative shape: job_title, company (and optionally industry) as [{ title, percentage }]
        const toItems = (arr: { title: string; percentage: string }[] | undefined) =>
          (arr ?? []).slice(0, 5).map((x) => {
            const { value, displayValue } = parsePctWithDisplay(x.percentage);
            return { label: x.title, value, ...(displayValue != null && { displayValue }) };
          });
        const jobTitle = (s as { job_title?: { title: string; percentage: string }[] }).job_title;
        const company = (s as { company?: { title: string; percentage: string }[] }).company;
        const industry = (s as { industry?: { title: string; percentage: string }[] }).industry;
        search = {
          totalAppearances: null,
          delta: null,
          direction: "neutral",
          whereYouAppeared: null,
          topTitles: toItems(jobTitle),
          topCompanies: toItems(company),
          foundFor: toItems(industry),
        };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[mapHomeData search section error]", e, rawSearch);
      search = null;
    }
  }

  // If search is still null but we have array-shaped insights (e.g. summary.insights), use them for "Who's finding you"
  if (!search && rawInsights) {
    const i = rawInsights as Record<string, unknown>;
    const hasArrays =
      Array.isArray(i.job_title) || Array.isArray(i.company) || Array.isArray(i.industry);
    if (hasArrays) {
      const toItems = (arr: { title: string; percentage: string }[] | undefined) =>
        (arr ?? []).slice(0, 5).map((x) => {
          const { value, displayValue } = parsePctWithDisplay(x.percentage);
          return { label: x.title, value, ...(displayValue != null && { displayValue }) };
        });
      search = {
        totalAppearances: null,
        delta: null,
        direction: "neutral",
        whereYouAppeared: null,
        topTitles: toItems(i.job_title as { title: string; percentage: string }[]),
        topCompanies: toItems(i.company as { title: string; percentage: string }[]),
        foundFor: toItems(i.industry as { title: string; percentage: string }[]),
      };
    }
  }

  let viewers: MappedHomeData["viewers"] = null;
  if (summary.profileViews) {
    const pv = summary.profileViews as ProfileViewsData;
    viewers = {
      total: parseNum(pv.totalViews),
      delta: pv.delta ?? null,
      direction: toDirection(
        pv.delta ? (pv.delta.startsWith("-") ? "red" : "green") : null,
      ),
      list: pv.viewers ?? [],
    };
  }

  const topPosts = mapTopPosts(
    summary.topPosts ?? summary.impressions28d?.top_posts,
  );

  function mapHistorical(
    cap: ImpressionsFullData | null,
  ): MappedHomeData["historicalImpressions"]["imp7d"] {
    if (!cap?.impressions) return null;
    return {
      total: parseNum(cap.impressions.totalImpression),
      delta: cap.impressions.deltaChange ?? null,
      direction: toDirection(cap.impressions.deltaColor),
    };
  }

  const imp7d = mapHistorical(historicalImpressions?.imp7Cap ?? null);
  const imp90d = mapHistorical(historicalImpressions?.imp90Cap ?? null);

  const membersReached = (s: typeof summary.impressions28d) => {
    if (!s) return null;
    const m = (s as { members?: { totalMembersReached: string } }).members;
    if (!m?.totalMembersReached) return null;
    return parseNum(m.totalMembersReached);
  };
  const membersReached7d = membersReached(summary.impressions7d);
  const membersReached28d = membersReached(summary.impressions28d);
  const membersReached90d = membersReached(summary.impressions90d);

  const linkClicks7d = summary.engagements7d?.visitsToLinks != null
    ? parseNum(summary.engagements7d.visitsToLinks)
    : null;
  const linkClicks28d = summary.engagements28d?.visitsToLinks != null
    ? parseNum(summary.engagements28d.visitsToLinks)
    : null;
  const linkClicks90d = summary.engagements90d?.visitsToLinks != null
    ? parseNum(summary.engagements90d.visitsToLinks)
    : null;

  const DONUT_COLORS: Record<keyof EngagementsSplit, string> = {
    reactions: "#2d7fe8",
    comments: "#22c787",
    reposts: "#f5a623",
    saves: "#a78bfa",
    sendsOnLinkedIn: "#4d5d73",
  };
  const DONUT_LABELS: Record<keyof EngagementsSplit, string> = {
    reactions: "Reactions",
    comments: "Comments",
    reposts: "Reposts",
    saves: "Saves",
    sendsOnLinkedIn: "Sends",
  };
  function mapEngagementsSplit(s: EngagementsSummary | null | undefined): MappedHomeData["engagementsSplit28d"] {
    const split = s?.engagements_split;
    if (!split) return null;
    const entries = (["reactions", "comments", "reposts", "saves", "sendsOnLinkedIn"] as const).map(
      (k) => ({ label: DONUT_LABELS[k], value: parseNum(split[k]) ?? 0, color: DONUT_COLORS[k] }),
    );
    return entries;
  }
  const engagementsSplit7d = mapEngagementsSplit(summary.engagements7d ?? null);
  const engagementsSplit28d = mapEngagementsSplit(summary.engagements28d);
  const engagementsSplit90d = mapEngagementsSplit(summary.engagements90d ?? null);

  // Use the most recent capturedAt from freshnessData when available; else summary.lastCapturedAt
  let lastCapturedAt: Date;
  if (freshnessData.length > 0) {
    const dates = freshnessData
      .map((d) => new Date(d.capturedAt).getTime())
      .filter((t) => !Number.isNaN(t));
    lastCapturedAt =
      dates.length > 0 ? new Date(Math.max(...dates)) : new Date(0);
  } else {
    try {
      lastCapturedAt = new Date(summary.lastCapturedAt);
      if (Number.isNaN(lastCapturedAt.getTime())) {
        lastCapturedAt = new Date(0);
      }
    } catch {
      lastCapturedAt = new Date(0);
    }
  }

  return {
    lastCapturedAt,
    hasAnyData,
    captureCount,
    freshnessMap,
    impressions7d,
    impressions28d,
    impressions90d,
    engagements7d,
    engagements28d,
    engagements90d,
    followers,
    followers7d,
    followers28d,
    followers90d,
    profileViews,
    searchAppearances,
    profile,
    audienceInsights,
    search,
    viewers,
    topPosts,
    historicalImpressions: { imp7d, imp90d },
    linkClicks7d,
    linkClicks28d,
    linkClicks90d,
    membersReached7d,
    membersReached28d,
    membersReached90d,
    engagementsSplit7d,
    engagementsSplit28d,
    engagementsSplit90d,
  };
}
