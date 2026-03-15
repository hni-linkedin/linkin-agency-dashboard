"use client";

export type BadgeVariant =
  | "accent"
  | "green"
  | "amber"
  | "red"
  | "neutral"
  | "outline";

const VARIANT_STYLES: Record<
  BadgeVariant,
  { color: string; bg: string; border: string }
> = {
  accent: {
    color: "var(--accent)",
    bg: "var(--accent-dim)",
    border: "var(--border-accent)",
  },
  green: {
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "var(--green-border)",
  },
  amber: {
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "var(--amber-border)",
  },
  red: {
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "var(--red-border)",
  },
  neutral: {
    color: "var(--text-secondary)",
    bg: "var(--bg-elevated)",
    border: "var(--border-subtle)",
  },
  outline: {
    color: "var(--text-muted)",
    bg: "transparent",
    border: "var(--border-default)",
  },
};

export interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({
  label,
  variant,
  size = "md",
  dot = false,
  pulse = false,
}: BadgeProps) {
  const styles = VARIANT_STYLES[variant];
  const padding = size === "sm" ? "1px 6px" : "2px 8px";
  const fontSize =
    size === "sm" ? "var(--text-2xs-size)" : "var(--text-xs-size)";
  const lineHeight =
    size === "sm" ? "var(--text-2xs-line)" : "var(--text-xs-line)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding,
        borderRadius: "var(--r-sm)",
        border: "1px dashed",
        borderColor: styles.border,
        background: styles.bg,
        color: styles.color,
        fontFamily: "var(--font-data)",
        fontSize,
        lineHeight,
      }}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "var(--r-full)",
            background: styles.color,
            flexShrink: 0,
            animation: pulse ? "pulse-dot 2s ease-in-out infinite" : undefined,
          }}
        />
      )}
      {label}
    </span>
  );
}
