/** Network dashboard — API-aligned shapes (overview + paginated listings). */

export type NetworkListingRow = {
  name: string;
  headline: string;
  profileUrl: string;
  image: string | null;
};

/** Raw capture payload — some endpoints use `heading` instead of `headline`. */
export type NetworkListingRowRaw = Omit<NetworkListingRow, "headline"> & {
  headline?: string;
  heading?: string;
};

export type NetworkListingApiResponse = {
  success?: boolean;
  total: number;
  data: NetworkListingRow[];
  capturedAt: string;
  error?: string;
};

export type NetworkListingApiResponseRaw = Omit<NetworkListingApiResponse, "data"> & {
  data: NetworkListingRowRaw[];
};

export type NetworkOverviewCounts = {
  connections: number;
  followers: number;
  following: number;
  overlapSignals: number;
  oneSidedFollows: number;
  /** Optional delta for followers stat (e.g. week-over-week). */
  followersDelta?: number;
};

export type NetworkOverviewMetaSlice = {
  capturedAt?: string;
};

export type NetworkOverviewMeta = {
  connections?: NetworkOverviewMetaSlice;
  followers?: NetworkOverviewMetaSlice;
  following?: NetworkOverviewMetaSlice;
};

export type NetworkPersonSample = {
  name: string;
  headline?: string;
  /** Same as headline; some APIs use `heading`. */
  heading?: string;
  profileUrl: string;
  image?: string | null;
};

export type NetworkCompanyItem = {
  company: string;
  count: number;
};

export type NetworkOverviewData = {
  counts: NetworkOverviewCounts;
  meta?: NetworkOverviewMeta;
  ratios?: { followerToConnection?: number | string };
  topCurrentCompanies?: NetworkCompanyItem[];
  overlapSample?: NetworkPersonSample[];
  oneSidedSample?: NetworkPersonSample[];
  /** First-page samples for badge cross-reference (best-effort). */
  connectionsSample?: NetworkPersonSample[];
  followersSample?: NetworkPersonSample[];
};

export type NetworkOverviewApiResponse = {
  success?: boolean;
  data?: NetworkOverviewData;
  error?: string;
} & Partial<NetworkOverviewData>;

export type NetworkTableTab = "connections" | "followers" | "following";
