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
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

export function RefreshDataButton({
  onClick,
  disabled = false,
  loading = false,
  label = "Refresh data",
  align = "flex-start",
  icon,
  ...rest
}: RefreshDataButtonProps) {
  const isLoading = loading || disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        alignSelf: align,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--accent-border)",
        background: isLoading ? "var(--bg-elevated)" : "var(--accent-dim)",
        color: isLoading ? "var(--text-muted)" : "var(--accent)",
        fontFamily: "var(--font-data)",
        fontSize: "var(--text-xs-size)",
        fontWeight: 500,
        cursor: isLoading ? "not-allowed" : "pointer",
      }}
      {...rest}
    >
      {icon ?? <RotateCw size={14} />}
      <span>{label}</span>
    </button>
  );
}

