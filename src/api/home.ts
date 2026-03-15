import axiosInstance from "@/lib/axios";
import { ApiError } from "@/lib/axios";
import type { HomeApiResponse, HomeData } from "@/types/home";

/**
 * Fetches home dashboard data for a client.
 *
 * @param clientId - Client identifier (path param)
 * @returns Promise<HomeData> — summary, freshnessData, historicalImpressions.
 *   summary: profile, impressions 7d/28d/90d, engagements 28d, audience, search, profileViews, lastCapturedAt.
 *   freshnessData: array of capture documents (used to build freshnessMap).
 *   historicalImpressions: imp7Cap, imp90Cap for trend comparison.
 * @throws ApiError when success is false or request fails
 */
export async function getHomeData(clientId: string): Promise<HomeData> {
  // Interceptor returns response.data, so we get the envelope directly
  const response = (await axiosInstance.get(
    `/api/capture/home/${clientId}`,
  )) as unknown as HomeApiResponse;

  if (!response.success) {
    throw new ApiError("API returned success: false", null);
  }

  return response.data;
}
