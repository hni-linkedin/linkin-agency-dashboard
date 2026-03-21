"use client";

import { SkeletonBlock } from "@/components";

/** Shimmer placeholder for Connections / Followers / Following (filters + table). */
export function NetworkTabListingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: "1 1 220px", minWidth: 180, maxWidth: 420 }}>
          <SkeletonBlock height={38} width="100%" radius="var(--r-md)" />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <SkeletonBlock height={36} width={100} radius="var(--r-md)" />
          <SkeletonBlock height={36} width={160} radius="var(--r-md)" />
        </div>
      </div>

      <SkeletonBlock height={12} width={200} radius="var(--r-sm)" />

      <div
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-card)",
          borderRadius: "var(--r-md)",
          overflowX: "auto",
          padding: "12px 0",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 1fr 180px 44px",
            gap: 8,
            padding: "0 14px 12px",
            borderBottom: "1px dashed var(--border-subtle)",
          }}
        >
          {["#", "Person", "Headline", "Status", ""].map((_, i) => (
            <SkeletonBlock key={i} height={12} width={i === 0 ? 24 : "80%"} radius="var(--r-sm)" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 1fr 180px 44px",
              gap: 8,
              alignItems: "center",
              padding: "12px 14px",
              borderBottom: "1px dashed var(--border-subtle)",
            }}
          >
            <SkeletonBlock height={14} width={20} radius="var(--r-sm)" />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SkeletonBlock height={30} width={30} radius="var(--r-full)" />
              <SkeletonBlock height={14} width="72%" radius="var(--r-sm)" />
            </div>
            <SkeletonBlock height={14} width="88%" radius="var(--r-sm)" />
            <SkeletonBlock height={22} width={100} radius="var(--r-sm)" />
            <SkeletonBlock height={16} width={16} radius="var(--r-sm)" />
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <SkeletonBlock height={14} width={200} radius="var(--r-sm)" />
        <div style={{ display: "flex", gap: 6 }}>
          <SkeletonBlock height={30} width={52} radius="var(--r-sm)" />
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBlock key={i} height={30} width={28} radius="var(--r-sm)" />
          ))}
          <SkeletonBlock height={30} width={52} radius="var(--r-sm)" />
        </div>
      </div>
    </div>
  );
}
