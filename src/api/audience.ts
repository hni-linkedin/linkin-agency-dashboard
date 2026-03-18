import axiosInstance from "@/lib/axios";
import { ApiError } from "@/lib/axios";
import type {
  AudienceDemographicsApiResponse,
  AudienceDemographicsData,
} from "@/types/audience";

export type AudienceDemographicsLatest = {
  data: AudienceDemographicsData;
  capturedAt: string;
  captureId: string;
};

/**
 * Latest audience demographics for a client.
 *
 * Backend contract:
 * GET /api/capture/audience-demographics/:clientId
 *
 * 200: { success: true, data: capture.parsedData.data, capturedAt, captureId }
 * 404: { success: false, error: "Audience demographics capture not found" }
 */
export async function fetchAudienceDemographics(
  clientId: string,
): Promise<AudienceDemographicsLatest> {
  const response = (await axiosInstance.get(
    `/api/capture/audience-demographics/${clientId}`,
  )) as unknown as AudienceDemographicsApiResponse;

  if (!response.success) {
    throw new ApiError(
      response.error ?? "Failed to load audience demographics",
      null,
    );
  }

  if (!response.data) {
    throw new ApiError("Audience demographics data missing", null);
  }

  if (!response.capturedAt || !response.captureId) {
    throw new ApiError(
      "Audience demographics capture metadata missing",
      null,
    );
  }

  return {
    data: response.data,
    capturedAt: response.capturedAt,
    captureId: response.captureId,
  };
}

