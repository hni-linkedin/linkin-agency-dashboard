"use client";

import { Badge } from "../Badge";

export type CaptureBadgeStatus = "captured" | "pending" | "stale" | "missing";

export interface CaptureBadgeProps {
  pageType: string;
  status: CaptureBadgeStatus;
  captureDate?: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function CaptureBadge({
  pageType,
  status,
  captureDate,
}: CaptureBadgeProps) {
  const label =
    status === "captured" && captureDate
      ? `${pageType} · ${formatDate(captureDate)}`
      : status === "pending"
        ? `${pageType} · Capturing...`
        : status === "stale"
          ? `${pageType} · Stale`
          : `${pageType} · Not captured`;

  const variant =
    status === "captured"
      ? "green"
      : status === "pending"
        ? "accent"
        : status === "stale"
          ? "amber"
          : "neutral";

  return (
    <Badge
      label={label}
      variant={variant}
      size="md"
      dot={status === "captured" || status === "pending"}
      pulse={status === "pending"}
    />
  );
}
