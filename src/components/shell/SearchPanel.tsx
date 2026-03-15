"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FileText,
  Network,
  Eye,
  Camera,
  Layers,
  CreditCard,
  Settings,
  LogOut,
  Sun,
  PanelLeftClose,
} from "lucide-react";
import { EmptyState } from "@/components";

type SearchItem = {
  id: string;
  icon: typeof LayoutDashboard;
  title: string;
  href?: string;
  action?: "signOut" | "toggleTheme" | "toggleSidebar";
  group: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  { id: "overview", icon: LayoutDashboard, title: "Overview", href: "/dashboard", group: "Pages" },
  { id: "posts", icon: FileText, title: "Posts", href: "/dashboard/posts", group: "Pages" },
  { id: "network", icon: Network, title: "Network", href: "/dashboard/network", group: "Pages" },
  { id: "viewers", icon: Eye, title: "Viewers", href: "/dashboard/viewers", group: "Pages" },
  { id: "captures", icon: Camera, title: "Captures", href: "/dashboard/captures", group: "Pages" },
  { id: "sessions", icon: Layers, title: "Sessions", href: "/dashboard/sessions", group: "Pages" },
  { id: "billing", icon: CreditCard, title: "Plan & Billing", href: "/dashboard/billing", group: "Pages" },
  { id: "settings", icon: Settings, title: "Settings", href: "/dashboard/settings", group: "Pages" },
  { id: "signout", icon: LogOut, title: "Sign out", action: "signOut", group: "Actions" },
  { id: "theme", icon: Sun, title: "Toggle theme", action: "toggleTheme", group: "Actions" },
  { id: "sidebar", icon: PanelLeftClose, title: "Collapse sidebar", action: "toggleSidebar", group: "Actions" },
];

export interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onAction: (action: "signOut" | "toggleTheme" | "toggleSidebar") => void;
}

export function SearchPanel({ open, onClose, onNavigate, onAction }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(query.trim().toLowerCase())
      )
    : SEARCH_ITEMS;

  const { flatIndexToItem, grouped } = useMemo(() => {
    const groupedMap = filtered.reduce<Record<string, SearchItem[]>>((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {});
    const flat: SearchItem[] = [];
    Object.values(groupedMap).forEach((items) => items.forEach((i) => flat.push(i)));
    return { flatIndexToItem: flat, grouped: groupedMap };
  }, [filtered]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
      const focusId = setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        clearTimeout(id);
        clearTimeout(focusId);
      };
    }
  }, [open]);

  useEffect(() => {
    const id = setTimeout(() => setSelectedIndex(0), 0);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (selectedIndex >= flatIndexToItem.length && flatIndexToItem.length > 0) {
      const id = setTimeout(
        () => setSelectedIndex(flatIndexToItem.length - 1),
        0,
      );
      return () => clearTimeout(id);
    }
  }, [selectedIndex, flatIndexToItem.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatIndexToItem.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatIndexToItem[selectedIndex];
        if (item) {
          if (item.action) {
            onAction(item.action);
          } else if (item.href) {
            router.push(item.href);
            onNavigate();
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatIndexToItem, selectedIndex, onClose, onNavigate, onAction, router]
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="search-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        key="search-modal-wrapper"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 201,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          padding: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 560,
            maxWidth: "100%",
            background: "var(--bg-overlay)",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
            transformOrigin: "center center",
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderBottom: "1px dashed var(--border-subtle)",
          }}
        >
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search clients, sessions, posts..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-base-size)",
              color: "var(--text-primary)",
            }}
          />
          <kbd
            style={{
              padding: "2px 6px",
              background: "var(--bg-card)",
              border: "1px dashed var(--border-subtle)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--text-disabled)",
            }}
          >
            Esc
          </kbd>
        </div>

        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {flatIndexToItem.length === 0 ? (
            <div style={{ padding: "32px 16px" }}>
              <EmptyState
                variant="filtered-empty"
                title={`No results for '${query}'`}
                body="Try a different search."
              />
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName}>
                <div
                  style={{
                    padding: "8px 16px 4px",
                    fontFamily: "var(--font-data)",
                    fontSize: "9px",
                    color: "var(--text-disabled)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {groupName}
                </div>
                {items.map((item) => {
                  const flatIdx = flatIndexToItem.indexOf(item);
                  const isSelected = flatIdx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.action) {
                          onAction(item.action);
                        } else if (item.href) {
                          router.push(item.href);
                          onNavigate();
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(flatIdx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        borderLeft: "2px solid transparent",
                        background: isSelected ? "var(--bg-card)" : "transparent",
                        borderLeftColor: isSelected ? "var(--accent)" : "transparent",
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                        fontWeight: 500,
                        fontSize: "var(--text-sm-size)",
                        color: "var(--text-primary)",
                        textAlign: "left",
                        transition: "all 100ms ease",
                      }}
                    >
                      <item.icon size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                      {item.title}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px dashed var(--border-subtle)",
            display: "flex",
            gap: 16,
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-2xs-size)",
            color: "var(--text-disabled)",
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>Esc close</span>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
