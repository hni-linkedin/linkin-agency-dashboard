import axiosInstance from "@/lib/axios";
import { ApiError } from "@/lib/axios";
import type {
  CapturesApiResponse,
  CapturesFilters,
  CaptureDeleteApiResponse,
  CaptureDeleteData,
} from "@/types/captures";

function buildCapturesQueryParams(filters: CapturesFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (filters.pageType) params.pageType = filters.pageType;
  if (filters.groupByPageType) params.groupBy = "pageType";

  // Allow `latestOnly=true` together with `groupBy=pageType`.
  // Backend ignores `latestOnly` in grouped mode, but we still accept the combination.
  if (filters.latestOnly) params.latestOnly = true;

  // Offset pagination.
  // If both limit + offset are provided, backend uses offset precedence.
  if (filters.limit != null) params.limit = filters.limit;
  if (filters.offset != null) params.offset = filters.offset;

  return params;
}

/**
 * Fetch captures list for a client.
 *
 * Backend contract:
 * GET /api/capture/client/:clientId
 * Query params:
 * - pageType (optional)
 * - groupBy=pageType (optional)
 * - latestOnly=true (optional; backend ignores it in grouped mode)
 * - limit (optional, used together with offset)
 * - offset (optional, 0-based pagination; used together with limit)
 */
export async function fetchCaptures(
  clientId: string,
  filters: CapturesFilters,
): Promise<CapturesApiResponse> {
  const response = (await axiosInstance.get(`/api/capture/client/${clientId}`, {
    params: buildCapturesQueryParams(filters),
  })) as unknown as CapturesApiResponse;

  if (!response.success) {
    throw new ApiError("API returned success: false", null);
  }

  return response;
}

/**
 * Soft-delete a capture by id.
 *
 * Backend contract:
 * DELETE /api/capture/:id
 * - 200: { success: true, data: { _id, deleted: true } }
 * - 404: { success: false, error: 'Capture not found' }
 */
export async function deleteCapture(captureId: string): Promise<CaptureDeleteData> {
  const response = (await axiosInstance.delete(`/api/capture/${captureId}`)) as unknown as CaptureDeleteApiResponse;

  if (!response.success) {
    throw new ApiError(response.error ?? "Failed to delete capture", null);
  }

  if (!response.data) {
    throw new ApiError("Failed to delete capture", null);
  }

  return response.data;
}

