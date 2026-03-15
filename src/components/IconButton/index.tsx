"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "../Tooltip";
import { SkeletonBlock } from "../SkeletonBlock";

export type IconButtonVariant = "ghost" | "outline" | "filled";

const VARIANT_STYLES: Record<
  IconButtonVariant,
  { bg: string; border: string; shadow: string }
> = {
  ghost: {
    bg: "transparent",
    border: "transparent",
    shadow: "0 0 0 0px transparent",
  },
  outline: {
    bg: "transparent",
    border: "var(--border-subtle)",
    shadow: "0 0 0 0px transparent",
  },
  filled: {
    bg: "var(--accent-dim)",
    border: "var(--border-accent)",
    shadow: "0 0 0 1px var(--border-accent)",
  },
};

const SIZES = { sm: 28, md: 32 } as const;

export interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
  variant?: IconButtonVariant;
  size?: "sm" | "md";
  disabled?: boolean;
  tooltip?: string;
  loading?: boolean;
}

export function IconButton({
  icon,
  onClick,
  variant = "ghost",
  size = "md",
  disabled = false,
  tooltip,
  loading = false,
}: IconButtonProps) {
  const px = SIZES[size];
  const baseStyles = VARIANT_STYLES[variant];

  const button = (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={disabled || loading ? undefined : { scale: 0.94 }}
      transition={{ duration: 0.15 }}
      style={{
        width: px,
        height: px,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: variant === "ghost" ? "none" : "1px dashed",
        borderRadius: "var(--r-md)",
        background: baseStyles.bg,
        borderColor: baseStyles.border,
        boxShadow: baseStyles.shadow,
        color: "var(--text-primary)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "background 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        e.currentTarget.style.background = "var(--bg-elevated)";
        if (variant === "outline") {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-default)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = baseStyles.bg;
        e.currentTarget.style.borderColor = baseStyles.border;
        e.currentTarget.style.boxShadow = baseStyles.shadow;
      }}
    >
      {loading ? (
        <SkeletonBlock
          width={14}
          height={14}
          radius="var(--r-md)"
        />
      ) : (
        icon
      )}
    </motion.button>
  );

  if (tooltip && !disabled) {
    return (
      <Tooltip content={tooltip} delay={400}>
        {button}
      </Tooltip>
    );
  }
  return button;
}
