"use client";

import { SkeletonBlock } from "@/components";
import { NetworkOverviewSkeleton } from "./NetworkOverviewSkeleton";
import { NetworkTabListingSkeleton } from "./NetworkTabListingSkeleton";

export type NetworkShellTab =
  | "overview"
  | "connections"
  | "followers"
  | "following";

export type NetworkRouteShellSkeletonProps = {
  /** Which tab’s body shimmer to show (matches URL `tab`). */
  activeTab: NetworkShellTab;
};

/**
 * Full Network page shell: title row, tab strip, and tab-specific body shimmer.
 */
export function NetworkRouteShellSkeleton({ activeTab }: NetworkRouteShellSkeletonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display-outfit)",
            fontWeight: 600,
            fontSize: "var(--text-lg-size)",
            lineHeight: "var(--text-lg-line)",
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Network
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <SkeletonBlock height={36} width={140} radius="var(--r-md)" />
          <SkeletonBlock height={14} width={180} radius="var(--r-sm)" />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          paddingBottom: 10,
          borderBottom: "1px dashed var(--border-subtle)",
        }}
      >
        {[
          { w: 88, label: "overview" },
          { w: 130, label: "conn" },
          { w: 120, label: "fol" },
          { w: 118, label: "fwing" },
        ].map(({ w, label }) => (
          <SkeletonBlock
            key={label}
            height={34}
            width={w}
            radius="var(--r-sm)"
          />
        ))}
      </div>

      {activeTab === "overview" ? (
        <NetworkOverviewSkeleton />
      ) : (
        <NetworkTabListingSkeleton />
      )}
    </div>
  );
}
