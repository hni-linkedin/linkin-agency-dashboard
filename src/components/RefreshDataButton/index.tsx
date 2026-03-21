"use client";

import { RotateCw } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type RefreshDataButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  align?: "flex-start" | "flex-end";
  icon?: ReactNode;
  /** `surface`: dashed card on `--bg-surface` (e.g. Network tab). Default: accent fill pill. */
  variant?: "default" | "surface";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

export function RefreshDataButton({
  onClick,
  disabled = false,
  loading = false,
  label = "Refresh data",
  align = "flex-start",
  icon,
  variant = "default",
  ...rest
}: RefreshDataButtonProps) {
  const isLoading = loading || disabled;
  const surface = variant === "surface";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        alignSelf: align,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: surface ? "8px 14px" : "6px 12px",
        borderRadius: "var(--r-md)",
        border: surface
          ? "1px dashed var(--border-card)"
          : "1px solid var(--accent-border)",
        background: surface
          ? isLoading
            ? "var(--bg-elevated)"
            : "var(--bg-surface)"
          : isLoading
            ? "var(--bg-elevated)"
            : "var(--accent-dim)",
        color: isLoading ? "var(--text-muted)" : "var(--accent)",
        fontFamily: "var(--font-data)",
        fontSize: surface ? "var(--text-sm-size)" : "var(--text-xs-size)",
        fontWeight: 500,
        cursor: isLoading ? "not-allowed" : "pointer",
        transition: "border-color 150ms ease, background 150ms ease",
      }}
      {...rest}
    >
      {icon ?? (
        <RotateCw
          size={surface ? 16 : 14}
          strokeWidth={2}
          className={loading ? "animate-spin" : undefined}
          aria-hidden
        />
      )}
      <span>{label}</span>
    </button>
  );
}

