export function normalizeAudiencePercentage(raw: string): number {
  // Examples from backend: "9.8%", "< 1%"
  const t = raw.trim();
  if (t.startsWith("<")) return 0.5;
  const numeric = Number(t.replace("%", "").trim());
  return Number.isFinite(numeric) ? numeric : 0;
}

export function toDisplayPercentage(raw: string): string {
  // Keep the original string for exact display ("< 1%" etc)
  return raw;
}

export function sortByAudiencePercentageDesc<T extends { percentage: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => normalizeAudiencePercentage(b.percentage) - normalizeAudiencePercentage(a.percentage),
  );
}


