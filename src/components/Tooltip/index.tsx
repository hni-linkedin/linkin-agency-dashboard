"use client";

import type { ReactNode } from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: string | ReactNode;
  side?: TooltipSide;
  delay?: number;
  children: ReactNode;
}

const OFFSET = 8;

export function Tooltip({
  content,
  side = "top",
  delay = 400,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(false);
  };

  const initial = (() => {
    const d = 4;
    switch (side) {
      case "top":
        return { opacity: 0, scale: 0.94, y: d };
      case "bottom":
        return { opacity: 0, scale: 0.94, y: -d };
      case "left":
        return { opacity: 0, scale: 0.94, x: d };
      case "right":
        return { opacity: 0, scale: 0.94, x: -d };
      default:
        return { opacity: 0, scale: 0.94, y: d };
    }
  })();

  const animate = (() => {
    switch (side) {
      case "top":
      case "bottom":
        return { opacity: 1, scale: 1, y: 0 };
      case "left":
      case "right":
        return { opacity: 1, scale: 1, x: 0 };
      default:
        return { opacity: 1, scale: 1, y: 0 };
    }
  })();

  const positionStyle =
    side === "top"
      ? { bottom: "100%", left: "50%", marginBottom: OFFSET, transform: "translateX(-50%)" }
      : side === "bottom"
        ? { top: "100%", left: "50%", marginTop: OFFSET, transform: "translateX(-50%)" }
        : side === "left"
          ? { right: "100%", top: "50%", marginRight: OFFSET, transform: "translateY(-50%)" }
          : { left: "100%", top: "50%", marginLeft: OFFSET, transform: "translateY(-50%)" };

  return (
    <div
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={initial}
            animate={animate}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.1 } }}
            transition={{
              duration: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: "absolute",
              ...positionStyle,
              zIndex: 9999,
              background: "var(--bg-overlay)",
              border: "1px dashed var(--border-default)",
              boxShadow: "0 0 0 1px var(--border-default)",
              borderRadius: "var(--r-md)",
              padding: "6px 10px",
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              lineHeight: "var(--text-xs-line)",
              color: "var(--text-primary)",
              maxWidth: "220px",
              pointerEvents: "none",
              whiteSpace: "normal",
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
