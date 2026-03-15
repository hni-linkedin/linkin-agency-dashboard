"use client";

export interface SkeletonBlockProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  lines?: number;
  lineSpacing?: number;
}

export function SkeletonBlock({
  width = "100%",
  height = 16,
  radius = "var(--r-md)",
  lines,
  lineSpacing = 10,
}: SkeletonBlockProps) {
  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;

  if (lines != null && lines > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: lineSpacing }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{
              width: i === lines - 1 ? "60%" : "100%",
              height: h,
              borderRadius: radius,
              background: `linear-gradient(90deg, var(--bg-elevated) 25%, rgba(255,255,255,0.06) 50%, var(--bg-elevated) 75%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.8s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="skeleton-shimmer"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: `linear-gradient(90deg, var(--bg-elevated) 25%, rgba(255,255,255,0.06) 50%, var(--bg-elevated) 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}
