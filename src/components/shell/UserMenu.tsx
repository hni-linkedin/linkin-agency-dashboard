"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, Key, CreditCard, BookOpen, Terminal, LogOut, ChevronDown } from "lucide-react";
import { Avatar, Badge } from "@/components";

export interface UserMenuUser {
  name: string;
  email: string;
  plan: string;
  avatarSrc?: string;
}

export interface UserMenuProps {
  user: UserMenuUser;
  onSignOut: () => void;
}

const MENU_ITEMS = [
  { icon: User, label: "Profile settings", href: "/dashboard/settings" },
  { icon: Key, label: "API Keys", href: "/dashboard/settings#api-keys" },
  { icon: CreditCard, label: "Plan & Billing", href: "/dashboard/billing" },
] as const;

const EXTERNAL_ITEMS = [
  { icon: BookOpen, label: "Documentation", href: "https://docs.linkinagency.com", external: true },
  { icon: Terminal, label: "API Playground", href: "https://api.linkinagency.com/playground", external: true },
] as const;

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          border: "1px dashed transparent",
          borderRadius: "var(--r-md)",
          background: "transparent",
          cursor: "pointer",
          color: "inherit",
          transition: "all 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.background = "var(--bg-elevated)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        <Avatar name={user.name} src={user.avatarSrc} size="sm" />
        <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 220,
              background: "var(--bg-overlay)",
              border: "1px dashed var(--border-default)",
              borderRadius: "var(--r-md)",
              overflow: "hidden",
              boxShadow: "var(--shadow-overlay)",
              zIndex: 100,
              transformOrigin: "top right",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px dashed var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={user.name} src={user.avatarSrc} size="md" />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: 13,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--text-xs-size)",
                      color: "var(--text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.email}
                  </div>
                  <Badge label={user.plan} variant="accent" size="sm" />
                </div>
              </div>
            </div>

            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "background 100ms, color 100ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}

            <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />

            {EXTERNAL_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 14px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "background 100ms, color 100ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-card)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <item.icon size={14} />
                {item.label} ↗
              </a>
            ))}

            <div style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 14px",
                border: "none",
                background: "transparent",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-sm-size)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 100ms, color 100ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--red-dim)";
                e.currentTarget.style.color = "var(--red)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
