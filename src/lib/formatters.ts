/**
 * Number formatting for display (StatCard, tables, etc.).
 * Single source of truth — no duplicate formatting in mappers or components.
 */

/**
 * Format a number for display: compact for large values (e.g. 14.2K), locale string otherwise.
 */
export function formatNumber(val: number | null): string {
  if (val === null || Number.isNaN(val)) return "—";
  if (val >= 1_000_000) {
    const m = val / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (val >= 1_000) {
    const k = val / 1_000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return val.toLocaleString();
}

/**
 * Format exact value with Indian counting system (lakhs/crores comma separation).
 * Use in KPI cards to show full number, e.g. 7,200 or 1,00,000.
 */
export function formatNumberIndian(val: number | null): string {
  if (val === null || Number.isNaN(val)) return "—";
  return val.toLocaleString("en-IN");
}
