import type { NetworkOverviewData } from "@/types/network";

function parseTime(value?: string): number {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function getMostRecentNetworkCaptureAt(data: NetworkOverviewData): string | null {
  const meta = data.meta;
  const times = [
    parseTime(meta?.connections?.capturedAt),
    parseTime(meta?.followers?.capturedAt),
    parseTime(meta?.following?.capturedAt),
  ].filter((t) => t > 0);

  if (times.length === 0) return null;
  const max = Math.max(...times);
  return new Date(max).toISOString();
}

export function formatCapturedAtLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
