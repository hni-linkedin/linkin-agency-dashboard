"use client";

import { SkeletonBlock } from "@/components";
import { DataCard } from "@/components";

export function OverviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Section 1 — Header meta */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <SkeletonBlock height={24} width={192} radius="var(--r-sm)" />
          <SkeletonBlock height={14} width={128} radius="var(--r-sm)" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SkeletonBlock height={24} width={80} radius="var(--r-full)" />
          <SkeletonBlock height={14} width={120} radius="var(--r-sm)" />
        </div>
      </div>

      {/* Section 2 — Freshness strip */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBlock key={i} height={28} width={64} radius="var(--r-md)" />
        ))}
      </div>

      {/* Section 3 — KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} height={96} radius="var(--r-md)" />
        ))}
      </div>

      {/* Section 4 — Window comparison */}
      <DataCard title="Members reached">
        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((_, i) => (
            <SkeletonBlock key={i} height={16} width="100%" radius="var(--r-sm)" />
          ))}
        </div>
      </DataCard>

      {/* Section 5 — Engagements + Top posts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        <DataCard title="Engagement breakdown">
          <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
            <SkeletonBlock height={160} width={160} radius="var(--r-full)" />
          </div>
        </DataCard>
        <DataCard title="Top posts" description="from impressions · 28d">
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <SkeletonBlock key={i} height={40} width="100%" radius="var(--r-sm)" />
            ))}
          </div>
        </DataCard>
      </div>

      {/* Section 6 — Audience + Search */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <DataCard title="Audience">
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <SkeletonBlock height={32} width="60%" radius="var(--r-sm)" />
            {[1, 2, 3].map((_, i) => (
              <SkeletonBlock key={i} height={14} width="100%" radius="var(--r-sm)" />
            ))}
          </div>
        </DataCard>
        <DataCard title="Who's finding you">
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <SkeletonBlock height={24} width={80} radius="var(--r-sm)" />
            {[1, 2, 3].map((_, i) => (
              <SkeletonBlock key={i} height={14} width="100%" radius="var(--r-sm)" />
            ))}
          </div>
        </DataCard>
      </div>
    </div>
  );
}
