"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export interface SortButtonProps {
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  children: ReactNode;
}

const springSnappy = { type: "spring" as const, stiffness: 400, damping: 30 };

export function SortButton({
  active,
  direction,
  onClick,
  children,
}: SortButtonProps) {
  const iconSize = 12;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: 0,
        border: "none",
        background: "transparent",
        fontFamily: "var(--font-data)",
        fontSize: "inherit",
        lineHeight: "inherit",
        letterSpacing: "inherit",
        textTransform: "inherit",
        color: active ? "var(--accent)" : "var(--text-muted)",
        cursor: "pointer",
        transition: "color 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-secondary)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {children}
      <motion.span
        initial={false}
        animate={{
          opacity: active ? 1 : 0,
          rotate: direction === "asc" ? 0 : 180,
        }}
        transition={springSnappy}
        style={{
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <ChevronUp size={iconSize} strokeWidth={2.5} />
      </motion.span>
    </button>
  );
}
