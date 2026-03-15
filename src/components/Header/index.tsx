"use client";

import type { ReactNode } from "react";
import { FreshnessStrip } from "../FreshnessStrip";
import { ThemeSwitcher } from "../ThemeSwitcher";

export interface FreshnessStatus {
  label: string;
  status: "fresh" | "due" | "overdue";
  lastCapture?: string;
}

export interface HeaderProps {
  clientName: string;
  lastCapture?: string;
  freshness: FreshnessStatus[];
  actions?: ReactNode;
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

export function Header({
  clientName,
  lastCapture,
  freshness,
  actions,
}: HeaderProps) {
  const items = freshness.map((f) => ({
    label: f.label,
    status: f.status,
    lastCapture: f.lastCapture,
  }));

  return (
    <header
      style={{
        height: "52px",
        background: "var(--bg-surface)",
        borderBottom: "1px dashed var(--border-subtle)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "var(--text-xl-size)",
            lineHeight: "var(--text-xl-line)",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          {clientName}
        </h1>
        {lastCapture != null && (
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: "var(--text-muted)",
            }}
          >
            Last capture: {formatDate(lastCapture)}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <FreshnessStrip items={items} />
        <ThemeSwitcher />
        {actions}
      </div>
    </header>
  );
}
