"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Table2,
  PieChart,
} from "lucide-react";
import { getClientWorkspaceIdFromPath } from "@/lib/dashboard-path";
import { IconButton, Tooltip } from "@/components";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";

function HexagonIcon({ size = 20 }: { size?: number }) {
  const s = size;
  const r = s / 2;
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${r + r * Math.cos(angle)},${r + r * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round">
      <polygon points={points} />
    </svg>
  );
}

export interface SidebarUser {
  name: string;
  email: string;
  plan: string;
  avatarSrc?: string;
}

export interface SidebarProps {
  activeRoute: string;
  collapsed: boolean;
  onToggle: () => void;
  onSignOut: () => void;
  role?: "admin" | "manager" | "client";
}

const NAV_TREE: {
  label: string;
  items: { href: string; icon: LucideIcon; label: string; badge?: string }[];
}[] = [
  {
    label: "ADMIN",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
      { href: "/dashboard/managers", icon: Users, label: "Managers" },
      { href: "/profile", icon: User, label: "Profile" },
    ],
  },
];

export function Sidebar({ collapsed, onToggle, onSignOut, role = "admin" }: SidebarProps) {
  const pathname = usePathname();

  const navTree: {
    label: string;
    items: { href: string; icon: LucideIcon; label: string; badge?: string }[];
  }[] = useMemo(() => {
    if (role === "manager") {
      const clientWorkspaceId = getClientWorkspaceIdFromPath(pathname);
      const items: { href: string; icon: LucideIcon; label: string; badge?: string }[] = [];
      if (clientWorkspaceId) {
        items.push(
          { href: `/dashboard/${clientWorkspaceId}`, icon: LayoutDashboard, label: "Overview" },
          { href: `/dashboard/${clientWorkspaceId}/captures`, icon: Table2, label: "Captures" },
          { href: `/dashboard/${clientWorkspaceId}/audience`, icon: PieChart, label: "Audience" },
        );
      } else {
        items.push(
          { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
          { href: "/dashboard/clients", icon: Users, label: "Clients" },
          { href: "/profile", icon: User, label: "Profile" },
        );
      }
      return [{ label: "MANAGER", items }];
    }
    if (role === "client") {
      return [
        {
          label: "CLIENT",
          items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
            { href: "/profile", icon: User, label: "Profile" },
          ],
        },
      ];
    }
    return NAV_TREE;
  }, [role, pathname]);

  const handleSignOut = () => {
    if (typeof window !== "undefined" && window.confirm("Sign out?")) {
      onSignOut();
    }
  };

  const widthPx = collapsed ? 52 : 200;

  return (
    <aside
      style={{
        gridArea: "sidebar",
        width: widthPx,
        minWidth: widthPx,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        borderRight: "1px dashed var(--border-subtle)",
        transition: "width 320ms cubic-bezier(0.4, 0, 0.2, 1), min-width 320ms cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 52,
          borderBottom: "1px dashed var(--border-subtle)",
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <HexagonIcon size={20} />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--text-primary)",
                }}
              >
                LinkinAgency
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <div style={{ marginLeft: collapsed ? 0 : "auto" }}>
            <IconButton
              icon={
                <motion.span
                  animate={{ scaleX: collapsed ? 1 : -1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{ display: "inline-flex" }}
                >
                  {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </motion.span>
              }
              onClick={onToggle}
              variant="ghost"
              size="sm"
            />
          </div>
        </Tooltip>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0", scrollbarWidth: "thin" }}>
        {navTree.map((group, index) => (
          <div key={group.label}>
            <SidebarGroup label={group.label} collapsed={collapsed}>
              {group.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  collapsed={collapsed}
                />
              ))}
            </SidebarGroup>
            {index < navTree.length - 1 && (
              <div
                style={{
                  borderBottom: "1px dashed var(--border-subtle)",
                  margin: "4px 14px 0",
                }}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px dashed var(--border-subtle)",
          padding: "10px 8px",
          flexShrink: 0,
        }}
      >
        <Tooltip content="Sign out" side="right">
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 8,
              minHeight: 36,
              boxSizing: "border-box",
              borderRadius: "var(--r-md)",
              cursor: "pointer",
              border: "1px dashed transparent",
              background: "transparent",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-data)",
              fontSize: 12,
              transition: "all 150ms ease",
              width: collapsed ? "100%" : "auto",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--red-border)";
              e.currentTarget.style.color = "var(--red)";
              e.currentTarget.style.background = "var(--red-dim)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={15} />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
