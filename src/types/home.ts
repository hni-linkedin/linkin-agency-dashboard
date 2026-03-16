/**
 * Types for GET /api/capture/home/:clientId
 * Raw API response envelope and nested data — no parsing, as returned by API.
 */

// ── Raw API response envelope ────────────────────────

export type HomeApiResponse = {
  success: boolean;
  data: HomeData;
};

// ── Top-level data object ────────────────────────────

export type HomeData = {
  summary: HomeSummary;
  freshnessData: CaptureDocument[];
  historicalImpressions: HistoricalImpressions;
};

// ── Summary ──────────────────────────────────────────

export type HomeSummary = {
  profile: ProfileData | null;
  impressions7d: ImpressionsSummary | null;
  impressions28d: ImpressionsSummary | null;
  impressions90d: ImpressionsSummary | null;
  engagements7d?: EngagementsSummary | null;
  engagements28d: EngagementsSummary | null;
  engagements90d?: EngagementsSummary | null;
  audience: AudienceData | null;
  audience7d?: AudienceData | null;
  audience28d?: AudienceData | null;
  audience90d?: AudienceData | null;
  search: SearchData | SearchAppearancesSummary | null;
  profileViews: ProfileViewsData | null;
  topPosts?: TopPost[] | null;
  lastCapturedAt: string;
};

// ── Impressions summary ──────────────────────────────

export type ImpressionsSummary = {
  totalImpression: string;
  deltaChange: string | null;
  deltaColor: "green" | "red" | null;
  top_posts?: TopPost[];
  impressions?: { totalImpression: string; deltaChange: string | null; deltaColor: "green" | "red" | null };
  members?: { totalMembersReached: string; deltaChange?: string | null; deltaColor?: "green" | "red" | null };
};

// ── Engagements summary ──────────────────────────────

export type EngagementsSplit = {
  reactions: string;
  comments: string;
  reposts: string;
  saves: string;
  sendsOnLinkedIn: string;
};

export type EngagementsSummary = {
  totalEngagements: string;
  deltaChange: string | null;
  deltaColor: "green" | "red" | null;
  top_posts?: TopPost[];
  engagements_split?: EngagementsSplit;
  visitsToLinks?: string | null;
};

// ── Top post (shared by impressions and engagements) ──

export type TopPost = {
  postDescription: string;
  engagementsCount: string;
  commentsCount: string;
  impressionsStat: string;
  impressionDeltaLabel: string;
  impressionDeltaColor: string;
};

// ── Profile ──────────────────────────────────────────

export type ProfileData = {
  name: string;
  headline: string;
  location: string;
  company: string;
  followers: string;
  connections: string;
  about: string;
  profileViews: string;
  postImpressions: string;
  searchApps: string;
  recentPosts: Record<string, unknown>[];
};

// ── Audience ─────────────────────────────────────────

/** Single insight item when API returns arrays (e.g. job_title, location, seniority) */
export type AudienceInsightItem = {
  title: string;
  percentage: string;
};

/** API may return insights as object (experience/location/industry) or as arrays (seniority, location, industry, job_title, company_size, company) */
export type AudienceInsightsShape =
  | {
      experience: AudienceInsight;
      location: AudienceInsight;
      industry: AudienceInsight;
    }
  | {
      job_title?: AudienceInsightItem[];
      location?: AudienceInsightItem[];
      industry?: AudienceInsightItem[];
      seniority?: AudienceInsightItem[];
      company_size?: AudienceInsightItem[];
      company?: AudienceInsightItem[];
    };

export type AudienceData = {
  followers?: {
    totalFollowers: string;
    deltaChange: string | null;
    deltaColor: "green" | "red" | null;
  };
  insights: AudienceInsightsShape;
};

export type AudienceInsight = {
  name: string;
  percentage: string;
};

// ── Search appearances (legacy shape) ────────────────

export type SearchData = {
  totalAppearances: string;
  delta: string | null;
  whereYouAppeared: {
    posts: string;
    networkRecommendations: string;
    comments: string;
    search: string;
  };
  topSearcherCompanies: SearchItem[];
  topSearcherTitles: SearchItem[];
  titlesFoundFor: SearchItem[];
};

export type SearchItem = {
  label: string;
  value: string;
};

// ── Search appearances (sectioned API shape) ─────────

/** "Where you appeared" block: total appearances, delta, and breakdown by surface. */
export type SearchAppearancesWhere = {
  totalAppearances: number | string;
  delta: number | string | null;
  whereYouAppeared: {
    posts: number | string;
    networkRecommendations: number | string;
    comments: number | string;
    search: number | string;
  };
};

/** Company that appeared in search searchers (optional logo). */
export type SearchSearcherCompany = {
  label: string;
  image?: string;
};

/** Segment with label and percentage (e.g. searcher title, "found for" keyword). */
export type SearchSegmentItem = {
  title: string;
  percentage: number;
};

/** Search appearances payload: where block + optional companies, titles, foundFor. */
export type SearchAppearancesSummary = {
  where: SearchAppearancesWhere;
  companies?: SearchSearcherCompany[];
  titles?: SearchSegmentItem[];
  foundFor?: SearchSegmentItem[];
};

// ── Profile views ────────────────────────────────────

export type ProfileViewsData = {
  totalViews: string;
  delta: string | null;
  viewers: Viewer[];
};

export type Viewer = {
  name: string;
  headline: string;
  avatar: string;
};

// ── Historical impressions ───────────────────────────

export type HistoricalImpressions = {
  imp7Cap: ImpressionsFullData | null;
  imp90Cap: ImpressionsFullData | null;
};

export type ImpressionsFullData = {
  impressions: {
    totalImpression: string;
    deltaChange: string | null;
    deltaColor: "green" | "red" | null;
  };
  members: {
    totalMembersReached: string | null;
    deltaChange: string | null;
    deltaColor: "green" | "red" | null;
  };
  top_posts: TopPost[];
};

// ── Freshness (Capture document from freshnessData array) ──

export type CaptureDocument = {
  _id: string;
  clientId: string;
  pageType: string;
  capturedAt: string;
  tabUrl: string;
  cloudinaryUrl: string;
  cloudinaryId: string;
  parseSuccess: boolean;
  parsedData: Record<string, unknown>;
  agentVersion: string | null;
  notes: string | null;
  deleted: false;
  createdAt: string;
  updatedAt: string;
};

// ── Freshness map (derived, not from API) ────────────

export type FreshnessMap = Record<string, string>;
