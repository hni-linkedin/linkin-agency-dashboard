"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

/* Fixed height for group header so nav item vertical positions match in expanded/collapsed states (was 16px top + ~12px line + 4px bottom) */
const GROUP_HEADER_HEIGHT = 32;

export interface SidebarGroupProps {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}

export function SidebarGroup({ label, collapsed, children }: SidebarGroupProps) {
  return (
    <div style={{ padding: "8px 0" }}>
      {/* Always reserve same height for group header to prevent vertical jitter when toggling */}
      <div
        style={{
          height: GROUP_HEADER_HEIGHT,
          display: "flex",
          alignItems: "flex-end",
          paddingLeft: 14,
          paddingRight: 14,
          paddingBottom: 4,
          boxSizing: "border-box",
        }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "9px",
                color: "var(--text-disabled)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>{children}</div>
    </div>
  );
}
