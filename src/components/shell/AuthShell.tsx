"use client";

import type { ReactNode } from "react";

export interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          zIndex: 2,
          fontFamily: "var(--font-display-outfit)",
          fontWeight: 700,
          fontSize: "var(--text-lg-size)",
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        LinkinAgency
      </div>
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
