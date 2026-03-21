export type ProfileExperienceItem = {
  heading: string | null;
  subheading: string | null;
  date: string | null;
};

export type ProfileCaptureData = {
  profileName: string | null;
  headline: string | null;
  location: string | null;
  about: string | null;
  topSkills: string | null;
  experience: ProfileExperienceItem[] | null;
  profileImage: string | null;
  bannerImage: string | null;
};

export type ProfileCaptureApiResponse = {
  success: boolean;
  data?: ProfileCaptureData;
  capturedAt?: string;
  captureId?: string;
  error?: string;
};
