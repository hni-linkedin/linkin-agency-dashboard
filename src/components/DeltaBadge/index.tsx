"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SkeletonBlock } from "../SkeletonBlock";

export interface DeltaBadgeProps {
  value: number;
  size?: "sm" | "md";
  loading?: boolean;
}

const springSnappy = { type: "spring" as const, stiffness: 400, damping: 30 };

export function DeltaBadge({
  value,
  size = "md",
  loading = false,
}: DeltaBadgeProps) {
  if (loading) {
    return (
      <SkeletonBlock
        width={size === "sm" ? 48 : 56}
        height={size === "sm" ? 18 : 20}
        radius="var(--r-md)"
      />
    );
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const arrow = isPositive ? "↑" : isNegative ? "↓" : "→";
  const displayValue = value.toFixed(1);
  const sign = isPositive ? "+" : "";

  const variantStyles = isPositive
    ? {
        color: "var(--green)",
        background: "var(--green-dim)",
        borderColor: "var(--green-border)",
      }
    : isNegative
      ? {
          color: "var(--red)",
          background: "var(--red-dim)",
          borderColor: "var(--red-border)",
        }
      : {
          color: "var(--text-muted)",
          background: "transparent",
          borderColor: "var(--border-subtle)",
        };

  const padding = size === "sm" ? "2px 6px" : "2px 7px";
  const fontSize = size === "sm" ? "var(--text-2xs-size)" : "var(--text-xs-size)";
  const lineHeight = size === "sm" ? "var(--text-2xs-line)" : "var(--text-xs-line)";

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${value}-${arrow}`}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springSnappy}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          padding,
        borderRadius: "var(--r-sm)",
        border: "1px dashed",
          fontFamily: "var(--font-data)",
          fontSize,
          lineHeight,
          letterSpacing: "var(--text-xs-tracking)",
          fontVariantNumeric: "tabular-nums",
          ...variantStyles,
        }}
      >
        {arrow} {sign}{displayValue}%
      </motion.span>
    </AnimatePresence>
  );
}
