import type { NetworkOverviewData } from "@/types/network";

export type NetworkBadgeSets = {
  connectionsSet: Set<string>;
  followersSet: Set<string>;
};

function addSampleUrls(set: Set<string>, sample?: { profileUrl?: string }[]) {
  if (!sample?.length) return;
  for (const row of sample) {
    const u = row.profileUrl?.trim();
    if (u) set.add(u);
  }
}

/**
 * Cross-reference sets for profile badges in listing tables.
 *
 * LIMITATION: These sets are built from `overviewData` sample arrays (typically the first
 * page of ~50 rows), not the full network lists. Counts like `counts.overlapSignals` remain
 * authoritative; badge cross-referencing on pages beyond the first page is best-effort unless
 * the overview endpoint is extended to return full `profileUrl` sets.
 */
export function buildNetworkBadgeSets(overviewData: NetworkOverviewData | null): NetworkBadgeSets {
  const connectionsSet = new Set<string>();
  const followersSet = new Set<string>();

  if (!overviewData) {
    return { connectionsSet, followersSet };
  }

  addSampleUrls(connectionsSet, overviewData.connectionsSample);
  addSampleUrls(followersSet, overviewData.followersSample);

  return { connectionsSet, followersSet };
}
