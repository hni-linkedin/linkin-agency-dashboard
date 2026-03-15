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
  engagements28d: EngagementsSummary | null;
  audience: AudienceData | null;
  search: SearchData | null;
  profileViews: ProfileViewsData | null;
  lastCapturedAt: string;
};

// ── Impressions summary ──────────────────────────────

export type ImpressionsSummary = {
  totalImpression: string;
  deltaChange: string | null;
  deltaColor: "green" | "red" | null;
  top_posts: TopPost[];
};

// ── Engagements summary ──────────────────────────────

export type EngagementsSummary = {
  totalEngagements: string;
  deltaChange: string | null;
  deltaColor: "green" | "red" | null;
  top_posts: TopPost[];
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

export type AudienceData = {
  followers: {
    totalFollowers: string;
    deltaChange: string | null;
    deltaColor: "green" | "red" | null;
  };
  insights: {
    experience: AudienceInsight;
    location: AudienceInsight;
    industry: AudienceInsight;
  };
};

export type AudienceInsight = {
  name: string;
  percentage: string;
};

// ── Search appearances ───────────────────────────────

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
