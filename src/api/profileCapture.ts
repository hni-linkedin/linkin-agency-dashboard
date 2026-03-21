import axiosInstance from "@/lib/axios";
import { ApiError } from "@/lib/axios";
import type { ProfileCaptureApiResponse, ProfileCaptureData } from "@/types/profileCapture";

export type ProfileCaptureLatest = {
  data: ProfileCaptureData;
  capturedAt: string;
  captureId: string;
};

/**
 * Latest profile_main capture for a client.
 * GET /api/capture/profile/:clientId
 */
export async function fetchProfileCapture(clientId: string): Promise<ProfileCaptureLatest> {
  const raw = (await axiosInstance.get(
    `/api/capture/profile/${clientId}`,
  )) as unknown as ProfileCaptureApiResponse;

  if (raw.success === false) {
    throw new ApiError(raw.error ?? "Profile capture not found", null);
  }

  if (!raw.data) {
    throw new ApiError("Profile data missing", null);
  }

  if (!raw.capturedAt || !raw.captureId) {
    throw new ApiError("Profile capture metadata missing", null);
  }

  return {
    data: raw.data,
    capturedAt: raw.capturedAt,
    captureId: raw.captureId,
  };
}
