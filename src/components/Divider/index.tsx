"use client";

export interface DividerProps {
  label?: string;
  spacing?: number;
  strength?: "subtle" | "default" | "strong";
}

const BORDER_MAP = {
  subtle: "var(--border-subtle)",
  default: "var(--border-default)",
  strong: "var(--border-strong)",
} as const;

export function Divider({
  label,
  spacing = 16,
  strength = "default",
}: DividerProps) {
  const borderColor = BORDER_MAP[strength];

  if (label != null) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: `${spacing}px 0`,
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            background: borderColor,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-2xs-size)",
            lineHeight: "var(--text-2xs-line)",
            color: "var(--text-muted)",
            letterSpacing: "var(--text-2xs-tracking)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: borderColor,
          }}
        />
      </div>
    );
  }

  return (
    <hr
      style={{
        margin: `${spacing}px 0`,
        border: "none",
        height: "1px",
        background: borderColor,
      }}
    />
  );
}
