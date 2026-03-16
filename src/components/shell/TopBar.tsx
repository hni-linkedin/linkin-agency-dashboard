"use client";

import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export interface TopBarUser {
  name: string;
  email: string;
  plan: string;
  avatarSrc?: string;
}

export interface TopBarProps {
  pageTitle?: string;
  user: TopBarUser;
  onSearchOpen: () => void;
  onThemeToggle: () => void;
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
  onSignOut: () => void;
  isMobile?: boolean;
  onHamburgerClick?: () => void;
}

export function TopBar({
  pageTitle = "Overview",
  user,
  onSearchOpen,
  onThemeToggle,
  theme,
  sidebarCollapsed: _sidebarCollapsed,
  onSignOut,
  isMobile = false,
  onHamburgerClick,
}: TopBarProps) {
  return (
    <header
      style={{
        gridArea: "topbar",
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 20px",
        background: "var(--bg-surface)",
        borderBottom: "1px dashed var(--border-subtle)",
        zIndex: 50,
      }}
    >
      {isMobile && onHamburgerClick && (
        <button
          type="button"
          onClick={onHamburgerClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-primary)",
            flexShrink: 0,
          }}
        >
          <Menu size={20} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: isMobile ? "center" : "flex-start" }}>
        {isMobile ? (
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
        ) : (
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-xl-size)",
              lineHeight: "var(--text-xl-line)",
              color: "var(--text-primary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pageTitle}
          </h1>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {isMobile ? (
          <button
            type="button"
            onClick={onSearchOpen}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <Search size={18} />
          </button>
        ) : (
          <button
          type="button"
          onClick={onSearchOpen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            width: 200,
            background: "var(--bg-elevated)",
            border: "1px dashed var(--border-subtle)",
            borderRadius: "var(--r-md)",
            cursor: "pointer",
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-sm-size)",
            color: "var(--text-muted)",
            transition: "box-shadow 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-default)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Search size={14} />
          <span style={{ flex: 1, textAlign: "left" }}>Search...</span>
          <kbd
            style={{
              padding: "2px 6px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-data)",
              fontSize: 11,
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            ⌘K
          </kbd>
        </button>
        )}

        <ThemeToggle theme={theme} onToggle={onThemeToggle} />

        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border-subtle)",
            border: "none",
          }}
        />

        <UserMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
