import axiosInstance from "@/lib/axios";
import { ApiError } from "@/lib/axios";
import type {
  NetworkListingApiResponse,
  NetworkListingApiResponseRaw,
  NetworkListingRow,
  NetworkListingRowRaw,
  NetworkOverviewApiResponse,
  NetworkOverviewData,
} from "@/types/network";

function normalizeListingRow(raw: NetworkListingRowRaw): NetworkListingRow {
  const headline = (raw.headline ?? raw.heading ?? "").trim();
  return {
    name: raw.name,
    headline,
    profileUrl: raw.profileUrl,
    image: raw.image ?? null,
  };
}

function normalizeListingResponse(raw: NetworkListingApiResponseRaw): NetworkListingApiResponse {
  return {
    ...raw,
    data: (raw.data ?? []).map(normalizeListingRow),
  };
}

function normalizeOverviewPayload(raw: NetworkOverviewApiResponse): NetworkOverviewData {
  if (
    raw.data &&
    typeof raw.data === "object" &&
    "counts" in raw.data &&
    raw.data.counts
  ) {
    return raw.data as NetworkOverviewData;
  }
  if (raw.counts) {
    const { success: _success, error: _error, data: _data, ...rest } = raw;
    void _success;
    void _error;
    void _data;
    return rest as NetworkOverviewData;
  }
  throw new ApiError("Network overview payload missing counts", null);
}

/**
 * GET /api/network/overview/:clientId
 */
export async function fetchNetworkOverview(clientId: string): Promise<NetworkOverviewData> {
  const raw = (await axiosInstance.get(
    `/api/network/overview/${clientId}`,
  )) as unknown as NetworkOverviewApiResponse;

  if (raw.success === false) {
    throw new ApiError(raw.error ?? "Failed to load network overview", null);
  }

  return normalizeOverviewPayload(raw);
}

/**
 * GET /api/capture/connections/:clientId?page=&limit=
 */
export async function fetchNetworkConnectionsPage(
  clientId: string,
  page: number,
  limit: number,
): Promise<NetworkListingApiResponse> {
  const raw = (await axiosInstance.get(
    `/api/capture/connections/${clientId}`,
    { params: { page, limit } },
  )) as unknown as NetworkListingApiResponseRaw;

  if (raw.success === false) {
    throw new ApiError(raw.error ?? "Failed to load connections", null);
  }

  return normalizeListingResponse(raw);
}

/**
 * GET /api/capture/followers/:clientId?page=&limit=
 */
export async function fetchNetworkFollowersPage(
  clientId: string,
  page: number,
  limit: number,
): Promise<NetworkListingApiResponse> {
  const raw = (await axiosInstance.get(
    `/api/capture/followers/${clientId}`,
    { params: { page, limit } },
  )) as unknown as NetworkListingApiResponseRaw;

  if (raw.success === false) {
    throw new ApiError(raw.error ?? "Failed to load followers", null);
  }

  return normalizeListingResponse(raw);
}

/**
 * GET /api/capture/following/:clientId?page=&limit=
 */
export async function fetchNetworkFollowingPage(
  clientId: string,
  page: number,
  limit: number,
): Promise<NetworkListingApiResponse> {
  const raw = (await axiosInstance.get(
    `/api/capture/following/${clientId}`,
    { params: { page, limit } },
  )) as unknown as NetworkListingApiResponseRaw;

  if (raw.success === false) {
    throw new ApiError(raw.error ?? "Failed to load following", null);
  }

  return normalizeListingResponse(raw);
}
