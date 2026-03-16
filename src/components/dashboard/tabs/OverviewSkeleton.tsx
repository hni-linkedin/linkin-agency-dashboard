"use client";

import { SkeletonBlock } from "@/components";
import { DataCard } from "@/components";

export function OverviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Section 1 — Header meta (name, headline, last captured, refresh) */}
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
          <SkeletonBlock height={28} width={192} radius="var(--r-sm)" />
          <SkeletonBlock height={14} width={160} radius="var(--r-sm)" />
          <div style={{ marginTop: 8 }}>
            <SkeletonBlock height={12} width={140} radius="var(--r-sm)" />
          </div>
        </div>
        <SkeletonBlock height={28} width={110} radius="var(--r-md)" />
      </div>

      {/* Section 2 — Freshness pills (Overdue, Fresh, Not captured, View all) */}
      <div className="flex flex-wrap items-center gap-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock
            key={i}
            height={44}
            width={i === 4 ? 88 : 100}
            radius="var(--r-lg)"
          />
        ))}
      </div>

      {/* Section 3 — KPI cards: 3 rows × 3 cards (Imp 7/28/90, Eng 7/28/90, Followers 7/28/90) */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[1, 2, 3].map((col) => (
              <SkeletonBlock
                key={col}
                height={120}
                width="100%"
                radius="var(--r-md)"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Section 4 — One row, 3 cols (40% | 20% | 40%): Engagement donut | Link clicks | Members reached */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_2fr] lg:items-stretch">
        <DataCard title="Engagement breakdown">
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
            }}
          >
            <SkeletonBlock height={160} width={160} radius="var(--r-full)" />
          </div>
        </DataCard>
        <DataCard title="Link clicks">
          <div
            style={{
              padding: "20px 16px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 20,
              minHeight: 200,
            }}
          >
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} height={100} width={44} radius="var(--r-md)" />
            ))}
          </div>
        </DataCard>
        <DataCard title="Members reached">
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <SkeletonBlock height={14} width={48} radius="var(--r-sm)" />
                  <SkeletonBlock height={14} width={56} radius="var(--r-sm)" />
                </div>
                <SkeletonBlock height={3} width="100%" radius="var(--r-sm)" />
              </div>
            ))}
          </div>
        </DataCard>
      </div>

      {/* Section 5 — Left: Audience + Top posts stacked; Right: Who's finding you */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <div className="flex min-h-0 flex-col gap-4">
          <DataCard title="Audience">
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <SkeletonBlock height={36} width="50%" radius="var(--r-sm)" />
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} height={14} width="100%" radius="var(--r-sm)" />
              ))}
            </div>
          </DataCard>
          <DataCard title="Top posts">
            <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonBlock key={i} height={48} width="100%" radius="var(--r-sm)" />
              ))}
            </div>
          </DataCard>
        </div>
        <DataCard title="Who's finding you">
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonBlock height={24} width={120} radius="var(--r-sm)" />
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} height={14} width="100%" radius="var(--r-sm)" />
            ))}
          </div>
        </DataCard>
      </div>
    </div>
  );
}
