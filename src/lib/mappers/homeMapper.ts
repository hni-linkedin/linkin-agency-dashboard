import { formatNumber } from "@/lib/formatters";
import type {
  AudienceData,
  CaptureDocument,
  HomeData,
  ImpressionsFullData,
  ImpressionsSummary,
  EngagementsSummary,
  FreshnessMap,
  ProfileData,
  ProfileViewsData,
  SearchData,
  TopPost,
  Viewer,
} from "@/types/home";

// ── Mapped types (exported for consumers) ─────────────

export type MappedStat = {
  value: number | null;
  display: string;
  delta: string | null;
  direction: "up" | "down" | "neutral";
};

export type MappedTopPost = {
  description: string;
  impressions: number;
  engagements: number;
  comments: number;
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
  engagements28d: MappedStat | null;
  followers: MappedStat | null;
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
    topCompanies: { label: string; value: number }[];
    topTitles: { label: string; value: number }[];
    foundFor: { label: string; value: number }[];
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

function parseNum(val: string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function fmt(val: number | null): string {
  return formatNumber(val);
}

function toDirection(
  color: "green" | "red" | null | undefined,
): "up" | "down" | "neutral" {
  if (color === "green") return "up";
  if (color === "red") return "down";
  return "neutral";
}

function parsePct(val: string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const s = val.replace(/%/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
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
    delta: deltaChange ?? null,
    direction: toDirection(deltaColor),
  };
}

function mapTopPosts(posts: TopPost[] | undefined): MappedTopPost[] {
  if (!posts?.length) return [];
  return posts.map((p) => ({
    description: p.postDescription,
    impressions: parseNum(p.impressionsStat) ?? 0,
    engagements: parseNum(p.engagementsCount) ?? 0,
    comments: parseNum(p.commentsCount) ?? 0,
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
  const { summary, freshnessData, historicalImpressions } = raw;

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

  const impressions7d = summary.impressions7d
    ? toStat(
        summary.impressions7d.totalImpression,
        summary.impressions7d.deltaChange,
        summary.impressions7d.deltaColor,
      )
    : null;
  const impressions28d = summary.impressions28d
    ? toStat(
        summary.impressions28d.totalImpression,
        summary.impressions28d.deltaChange,
        summary.impressions28d.deltaColor,
      )
    : null;
  const impressions90d = summary.impressions90d
    ? toStat(
        summary.impressions90d.totalImpression,
        summary.impressions90d.deltaChange,
        summary.impressions90d.deltaColor,
      )
    : null;
  const engagements28d = summary.engagements28d
    ? toStat(
        summary.engagements28d.totalEngagements,
        summary.engagements28d.deltaChange,
        summary.engagements28d.deltaColor,
      )
    : null;

  const followers = summary.audience?.followers
    ? toStat(
        summary.audience.followers.totalFollowers,
        summary.audience.followers.deltaChange,
        summary.audience.followers.deltaColor,
      )
    : null;

  const profileViews = summary.profileViews
    ? toStat(
        summary.profileViews.totalViews,
        summary.profileViews.delta,
        null,
      )
    : null;

  const searchAppearances = summary.search
    ? toStat(
        summary.search.totalAppearances,
        summary.search.delta,
        null,
      )
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
  if (summary.audience?.insights) {
    const i = summary.audience.insights;
    audienceInsights = {
      experience: i.experience
        ? {
            name: i.experience.name,
            percentage: parsePct(i.experience.percentage) ?? 0,
          }
        : null,
      location: i.location
        ? {
            name: i.location.name,
            percentage: parsePct(i.location.percentage) ?? 0,
          }
        : null,
      industry: i.industry
        ? {
            name: i.industry.name,
            percentage: parsePct(i.industry.percentage) ?? 0,
          }
        : null,
    };
  }

  let search: MappedHomeData["search"] = null;
  if (summary.search) {
    const s = summary.search as SearchData;
    const where = s.whereYouAppeared;
    search = {
      totalAppearances: parseNum(s.totalAppearances),
      delta: s.delta ?? null,
      direction: toDirection(
        s.delta ? (s.delta.startsWith("-") ? "red" : "green") : null,
      ),
      whereYouAppeared: where
        ? {
            posts: parseNum(where.posts) ?? 0,
            networkRecommendations: parseNum(where.networkRecommendations) ?? 0,
            comments: parseNum(where.comments) ?? 0,
            search: parseNum(where.search) ?? 0,
          }
        : null,
      topCompanies: (s.topSearcherCompanies ?? []).map((x) => ({
        label: x.label,
        value: parseNum(x.value) ?? 0,
      })),
      topTitles: (s.topSearcherTitles ?? []).map((x) => ({
        label: x.label,
        value: parseNum(x.value) ?? 0,
      })),
      foundFor: (s.titlesFoundFor ?? []).map((x) => ({
        label: x.label,
        value: parseNum(x.value) ?? 0,
      })),
    };
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

  const topPosts = mapTopPosts(summary.impressions28d?.top_posts);

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

  const imp7d = mapHistorical(historicalImpressions.imp7Cap ?? null);
  const imp90d = mapHistorical(historicalImpressions.imp90Cap ?? null);

  let lastCapturedAt: Date;
  try {
    lastCapturedAt = new Date(summary.lastCapturedAt);
    if (Number.isNaN(lastCapturedAt.getTime())) {
      lastCapturedAt = new Date(0);
    }
  } catch {
    lastCapturedAt = new Date(0);
  }

  return {
    lastCapturedAt,
    hasAnyData,
    captureCount,
    freshnessMap,
    impressions7d,
    impressions28d,
    impressions90d,
    engagements28d,
    followers,
    profileViews,
    searchAppearances,
    profile,
    audienceInsights,
    search,
    viewers,
    topPosts,
    historicalImpressions: { imp7d, imp90d },
  };
}
