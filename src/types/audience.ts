export type AudiencePercentageItem = {
  title: string;
  percentage: string;
};

export type AudienceDemographicsData = {
  job_title: AudiencePercentageItem[];
  location: AudiencePercentageItem[];
  industry: AudiencePercentageItem[];
  seniority: AudiencePercentageItem[];
  company_size: AudiencePercentageItem[];
  company: AudiencePercentageItem[];
};

export type AudienceDemographicsApiResponse = {
  success: boolean;
  data: AudienceDemographicsData | null;
  capturedAt?: string;
  captureId?: string;
  error?: string;
};

