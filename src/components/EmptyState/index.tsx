"use client";

import type { ReactNode } from "react";

export type EmptyStateVariant =
  | "zero-capture"
  | "one-capture"
  | "filtered-empty"
  | "error";

const DEFAULT_COPY: Record<
  EmptyStateVariant,
  { title: string; body: string }
> = {
  "zero-capture": {
    title: "No data yet",
    body: "Capture this profile to start tracking.",
  },
  "one-capture": {
    title: "Not enough data",
    body: "Trend charts need at least 2 captures.",
  },
  "filtered-empty": {
    title: "No results",
    body: "Try adjusting your filters.",
  },
  error: {
    title: "Failed to load",
    body: "Something went wrong. Try refreshing.",
  },
};

const VARIANT_ICONS: Record<EmptyStateVariant, ReactNode> = {
  "zero-capture": (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--text-muted)" }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  "one-capture": (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--text-muted)" }}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  "filtered-empty": (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--text-muted)" }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  error: (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--text-muted)" }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  title?: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  variant,
  title,
  body,
  action,
}: EmptyStateProps) {
  const copy = DEFAULT_COPY[variant];
  const displayTitle = title ?? copy.title;
  const displayBody = body ?? copy.body;
  const icon = VARIANT_ICONS[variant];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "16px" }}>{icon}</div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "var(--text-md-size)",
          lineHeight: "var(--text-md-line)",
          color: "var(--text-secondary)",
          marginBottom: "8px",
        }}
      >
        {displayTitle}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-sm-size)",
          lineHeight: "var(--text-sm-line)",
          color: "var(--text-muted)",
          maxWidth: "300px",
          marginBottom: action ? "16px" : 0,
        }}
      >
        {displayBody}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-sm-size)",
            color: "var(--accent)",
            background: "transparent",
            border: "1px dashed transparent",
            boxShadow: "0 0 0 0px transparent",
            borderRadius: "var(--r-md)",
            padding: "8px 12px",
            cursor: "pointer",
            transition: "border-color 150ms ease, box-shadow 150ms ease, background 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-accent)";
            e.currentTarget.style.background = "var(--accent-muted)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.boxShadow = "0 0 0 0px transparent";
            e.currentTarget.style.background = "transparent";
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
