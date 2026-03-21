"use client";

import { SkeletonBlock } from "@/components";

export function ClientProfileSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <SkeletonBlock height={28} width={260} radius="var(--r-sm)" />
          <SkeletonBlock height={12} width={180} radius="var(--r-sm)" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <SkeletonBlock height={32} width={150} radius="var(--r-md)" />
          <SkeletonBlock height={12} width={120} radius="var(--r-sm)" />
        </div>
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-card)",
          borderRadius: "var(--r-md)",
          overflow: "visible",
        }}
      >
        <div
          style={{
            borderRadius: "var(--r-md) var(--r-md) 0 0",
            overflow: "hidden",
          }}
        >
          <SkeletonBlock height={132} width="100%" radius="0" />
        </div>
        <div
          style={{
            padding: "0 1.35rem 1.35rem",
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div style={{ marginTop: -47, flexShrink: 0, position: "relative", zIndex: 1 }}>
            <SkeletonBlock width={94} height={94} radius="var(--r-full)" />
          </div>
          <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 10, paddingTop: 10 }}>
            <SkeletonBlock height={22} width="72%" radius="var(--r-sm)" />
            <SkeletonBlock height={14} width="96%" radius="var(--r-sm)" />
            <SkeletonBlock height={14} width="48%" radius="var(--r-sm)" />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              padding: "1rem 1.2rem",
              minHeight: 140,
            }}
          >
            <SkeletonBlock height={10} width={80} radius="var(--r-sm)" />
            <div style={{ height: 12 }} />
            <SkeletonBlock height={12} width="100%" radius="var(--r-sm)" />
            <div style={{ height: 8 }} />
            <SkeletonBlock height={12} width="94%" radius="var(--r-sm)" />
            <div style={{ height: 8 }} />
            <SkeletonBlock height={12} width="88%" radius="var(--r-sm)" />
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-card)",
          borderRadius: "var(--r-md)",
          padding: "1rem 1.2rem",
        }}
      >
        <SkeletonBlock height={10} width={100} radius="var(--r-sm)" />
        <div style={{ height: 14 }} />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              marginBottom: i < 2 ? 16 : 0,
              paddingLeft: 4,
            }}
          >
            <div style={{ marginTop: 4 }}>
              <SkeletonBlock width={10} height={10} radius="var(--r-full)" />
            </div>
            <div style={{ flex: 1 }}>
              <SkeletonBlock height={14} width="70%" radius="var(--r-sm)" />
              <div style={{ height: 6 }} />
              <SkeletonBlock height={12} width="50%" radius="var(--r-sm)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
