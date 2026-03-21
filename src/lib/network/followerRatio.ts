/**
 * API may send `ratios.followerToConnection` as a number or string (e.g. `"1.80"`).
 */
export function parseFollowerToConnectionRatio(
  raw: number | string | undefined | null,
): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Multiplier text for the follower ratio headline (e.g. `1.80` from 1.8). */
export function formatFollowerConnectionMultiplier(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(2);
}
