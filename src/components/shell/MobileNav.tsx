"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Table2,
  PieChart,
  Network,
  Contact,
} from "lucide-react";
import { Avatar, Badge } from "@/components";
import { getClientWorkspaceIdFromPath } from "@/lib/dashboard-path";
import type { SidebarUser } from "./Sidebar";
import { SidebarGroup } from "./SidebarGroup";

const NAV_TREE: { label: string; items: { href: string; icon: LucideIcon; label: string; badge?: string }[] }[] = [
  {
    label: "ADMIN",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
      { href: "/dashboard/managers", icon: Users, label: "Managers" },
      { href: "/profile", icon: User, label: "Profile" },
    ],
  },
];

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  user: SidebarUser;
  onSignOut: () => void;
  role?: "admin" | "manager" | "client";
}

export function MobileNav({ open, onClose, user, onSignOut, role = "admin" }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navTree = useMemo(() => {
    if (role === "manager") {
      const clientWorkspaceId = getClientWorkspaceIdFromPath(pathname);
      const items: { href: string; icon: LucideIcon; label: string; badge?: string }[] = [];
      if (clientWorkspaceId) {
        items.push(
          { href: `/dashboard/${clientWorkspaceId}`, icon: LayoutDashboard, label: "Overview" },
          { href: `/dashboard/${clientWorkspaceId}/captures`, icon: Table2, label: "Captures" },
          { href: `/dashboard/${clientWorkspaceId}/audience`, icon: PieChart, label: "Audience" },
          { href: `/dashboard/${clientWorkspaceId}/network`, icon: Network, label: "Network" },
          { href: `/dashboard/${clientWorkspaceId}/profile`, icon: Contact, label: "Profile" },
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

  const handleLink = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 150,
              background: "var(--bg-base)",
            }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: 280,
              zIndex: 151,
              background: "var(--bg-surface)",
              borderRight: "1px dashed var(--border-subtle)",
              overflowY: "auto",
              paddingTop: 52,
            }}
          >
            <nav style={{ padding: "8px 0" }}>
              {navTree.map((group) => (
                <SidebarGroup key={group.label} label={group.label} collapsed={false}>
                  {group.items.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleLink(item.href)}
                      style={{
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 12,
                        gap: 10,
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                        fontWeight: 500,
                        fontSize: 13,
                        color: "var(--text-primary)",
                        textAlign: "left",
                      }}
                    >
                      <item.icon size={15} style={{ flexShrink: 0 }} />
                      {item.label}
                      {item.badge && (
                        <span style={{ marginLeft: "auto", marginRight: 8 }}>
                          <Badge label={item.badge} variant="accent" size="sm" />
                        </span>
                      )}
                    </button>
                  ))}
                </SidebarGroup>
              ))}
            </nav>
            <div
              style={{
                borderTop: "1px dashed var(--border-subtle)",
                padding: "10px 8px",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 8,
                  borderRadius: "var(--r-md)",
                }}
              >
                <Avatar name={user.name} src={user.avatarSrc} size="sm" />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: 12,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name}
                  </div>
                  <Badge label={user.plan} variant="accent" size="sm" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 8,
                  borderRadius: "var(--r-md)",
                  border: "1px dashed transparent",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-data)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  width: "100%",
                  marginTop: 6,
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
                Sign out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
