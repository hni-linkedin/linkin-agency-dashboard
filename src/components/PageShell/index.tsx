"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface PageShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  loading?: boolean;
}

export function PageShell({
  sidebar,
  header,
  children,
  loading = false,
}: PageShellProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        minHeight: "100vh",
        background: "var(--bg-base)",
      }}
    >
      {sidebar}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
          {header}
        </div>
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={loading ? "loading" : "content"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
