"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Tooltip, Badge } from "@/components";
import { isSidebarPathActive } from "@/lib/dashboard-path";

export interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
  collapsed: boolean;
}

export function SidebarItem({ href, icon: Icon, label, badge, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = isSidebarPathActive(pathname, href);
  const [hover, setHover] = useState(false);

  const isHover = hover && !isActive;
  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    height: 34,
    display: "flex",
    alignItems: "center",
    paddingLeft: collapsed ? 0 : 12,
    gap: 10,
    borderLeft: "2px solid transparent",
    borderTopRightRadius: "var(--r-md)",
    borderBottomRightRadius: "var(--r-md)",
    cursor: "pointer",
    transition: "all 120ms ease",
    color: isActive ? "var(--text-primary)" : isHover ? "var(--text-secondary)" : "var(--text-muted)",
    background: isActive ? "var(--bg-card)" : isHover ? "var(--bg-elevated)" : "transparent",
    borderLeftColor: isActive ? "var(--accent)" : "transparent",
    boxShadow: isActive ? "inset 0 0 0 1px var(--border-subtle)" : "none",
    width: collapsed ? 52 : "100%",
    justifyContent: collapsed ? "center" : "flex-start",
  };

  const content = (
    <>
      <Icon size={15} style={{ flexShrink: 0 }} />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "13px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && badge && (
        <span style={{ marginLeft: "auto", marginRight: 8 }}>
          <Badge label={badge} variant="accent" size="sm" />
        </span>
      )}
    </>
  );

  const el = (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "inherit", display: "flex", minWidth: 0 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={wrapperStyle}>
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 2,
              background: "var(--accent)",
              borderTopRightRadius: "var(--r-md)",
              borderBottomRightRadius: "var(--r-md)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}
        {content}
      </div>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip content={label} side="right">
        <div style={{ display: "flex", justifyContent: "center" }}>{el}</div>
      </Tooltip>
    );
  }
  return el;
}
