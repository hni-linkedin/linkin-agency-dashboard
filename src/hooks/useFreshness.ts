"use client";

import type { FreshnessMap } from "@/types/home";

export type FreshnessStatus = "fresh" | "due" | "overdue" | "never";

export type UseFreshnessReturn = {
  getStatus: (pageType: string) => FreshnessStatus;
  getLastCaptured: (pageType: string) => Date | null;
  getDaysSince: (pageType: string) => number | null;
};

/**
 * Derives freshness status per pageType from a freshness map.
 * Status logic:
 * - never:   pageType not in map
 * - fresh:   daysSince < dueDays - 2
 * - due:     dueDays - 2 <= daysSince <= dueDays + 1
 * - overdue: daysSince > dueDays + 1
 */
export function useFreshness(
  freshnessMap: FreshnessMap | null,
  dueDays = 7,
): UseFreshnessReturn {
  function getLastCaptured(pageType: string): Date | null {
    if (!freshnessMap) return null;
    const iso = freshnessMap[pageType];
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function getDaysSince(pageType: string): number | null {
    const captured = getLastCaptured(pageType);
    if (!captured) return null;
    const now = new Date();
    const diffMs = now.getTime() - captured.getTime();
    return Math.floor(diffMs / (24 * 60 * 60 * 1000));
  }

  function getStatus(pageType: string): FreshnessStatus {
    if (!freshnessMap || !(pageType in freshnessMap)) return "never";
    const days = getDaysSince(pageType);
    if (days === null) return "never";
    if (days < dueDays - 2) return "fresh";
    if (days <= dueDays + 1) return "due";
    return "overdue";
  }

  return {
    getStatus,
    getLastCaptured,
    getDaysSince,
  };
}
