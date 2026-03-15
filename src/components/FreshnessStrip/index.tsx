"use client";

import { FreshnessIndicator } from "../FreshnessIndicator";
import { Badge } from "../Badge";

export interface FreshnessItem {
  label: string;
  status: "fresh" | "due" | "overdue";
  lastCapture?: string;
}

export interface FreshnessStripProps {
  items: FreshnessItem[];
}

export function FreshnessStrip({ items }: FreshnessStripProps) {
  const allFresh = items.length > 0 && items.every((i) => i.status === "fresh");

  if (allFresh) {
    return (
      <Badge
        label="All data current"
        variant="green"
        size="md"
        dot
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {items.map((item) => (
        <FreshnessIndicator
          key={item.label}
          label={item.label}
          status={item.status}
          lastCapture={item.lastCapture}
          compact
        />
      ))}
    </div>
  );
}
