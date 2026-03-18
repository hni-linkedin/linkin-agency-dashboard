/**
 * Types for GET /api/capture/client/:clientId
 */

export type CaptureParseStatus = boolean;

export type CaptureDocument = {
  _id: string;
  pageType?: string;
  capturedAt: string;
  clientName?: string;
  tabUrl?: string;
  parseSuccess?: CaptureParseStatus;
  notes?: string;
  deleted?: boolean;
};

export type CapturesApiResponse = {
  success: boolean;
  count: number;
  data: CaptureDocument[];
};

export type CapturesFilters = {
  pageType?: string;
  /**
   * When true, sends `groupBy=pageType`.
   * Grouped mode returns latest capture per pageType.
   */
  groupByPageType?: boolean;
  /**
   * When true, sends `latestOnly=true`.
   * Backend ignores this flag when `groupBy=pageType` is enabled.
   */
  latestOnly?: boolean;
  limit?: number;
  /**
   * Offset pagination: skip `offset` captures, then take `limit` captures.
   * 0-based offset.
   */
  offset?: number;
};

// ── Delete capture ───────────────────────────────────

export type CaptureDeleteData = {
  _id: string;
  deleted: true;
};

export type CaptureDeleteApiResponse = {
  success: boolean;
  data?: CaptureDeleteData;
  error?: string;
};

