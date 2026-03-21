"use client";

import { SkeletonBlock } from "@/components";

export function NetworkOverviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "20px 24px",
            }}
          >
            <SkeletonBlock height={10} width="52%" radius="var(--r-sm)" />
            <div style={{ height: 10 }} />
            <SkeletonBlock height={40} width="68%" radius="var(--r-md)" />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "16px 20px",
              minHeight: 220,
            }}
          >
            <SkeletonBlock height={10} width="40%" radius="var(--r-sm)" />
            <div style={{ height: 12 }} />
            <SkeletonBlock height={22} width="72%" radius="var(--r-md)" />
            <div style={{ height: 16 }} />
            <SkeletonBlock lines={4} lineSpacing={10} height={12} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "16px 20px",
              minHeight: 200,
            }}
          >
            <SkeletonBlock height={10} width="36%" radius="var(--r-sm)" />
            <div style={{ height: 12 }} />
            <SkeletonBlock lines={5} lineSpacing={12} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}
