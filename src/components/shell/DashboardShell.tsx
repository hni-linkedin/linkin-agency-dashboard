"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SearchPanel } from "./SearchPanel";
import { MobileNav } from "./MobileNav";
import { useMediaQuery } from "./useMediaQuery";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/posts": "Posts",
  "/dashboard/network": "Network",
  "/dashboard/viewers": "Viewers",
  "/dashboard/captures": "Captures",
  "/dashboard/sessions": "Sessions",
  "/dashboard/timeline": "Timeline",
  "/dashboard/settings": "Settings",
  "/dashboard/billing": "Plan & Billing",
};

function getPageTitle(pathname: string): string {
  if (pathname.endsWith("/audience")) return "Audience";
  return PAGE_TITLES[pathname] ?? "Overview";
}

const DEMO_USER = {
  name: "Alex Chen",
  email: "alex@acme.co",
  plan: "Growth",
  avatarSrc: undefined,
};

export interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 767px)");
  // Fixed initial state so server and client match (avoids hydration error). Synced from localStorage in useEffect.
  const [collapsed, setCollapsed] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Restore sidebar/theme from localStorage after mount to avoid server/client HTML mismatch (hydration).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync from localStorage after hydration only */
    const storedCollapsed = localStorage.getItem("sidebar-collapsed");
    if (storedCollapsed !== null) setCollapsed(storedCollapsed === "true");
    const storedTheme = localStorage.getItem("la-theme") as "dark" | "light" | null;
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("la-theme", theme);
    root.dispatchEvent(new CustomEvent("theme-change", { detail: { theme } }));
  }, [theme]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const handleSignOut = useCallback(() => {
    window.location.href = "/login";
  }, []);

  const pageTitle = getPageTitle(pathname);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "grid",
        gridTemplateAreas: isMobile ? '"topbar" "content"' : '"sidebar topbar" "sidebar content"',
        gridTemplateColumns: isMobile ? "1fr" : "auto 1fr",
        gridTemplateRows: "52px 1fr",
        background: "var(--bg-base)",
      }}
    >
      {!isMobile && (
        <Sidebar
          activeRoute={pathname}
          collapsed={collapsed}
          onToggle={toggleSidebar}
          onSignOut={handleSignOut}
        />
      )}
      <TopBar
        pageTitle={pageTitle}
        user={DEMO_USER}
        onSearchOpen={() => setSearchOpen(true)}
        onThemeToggle={toggleTheme}
        theme={theme}
        sidebarCollapsed={collapsed}
        onSignOut={handleSignOut}
        isMobile={isMobile}
        onHamburgerClick={() => setMobileNavOpen(true)}
      />
      <main
        style={{
          gridArea: "content",
          overflowY: "auto",
          background: "var(--bg-base)",
          scrollbarWidth: "thin",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: "28px 32px", minHeight: "100%" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={() => setSearchOpen(false)}
        onAction={(action) => {
          if (action === "signOut") handleSignOut();
          if (action === "toggleTheme") toggleTheme();
          if (action === "toggleSidebar") toggleSidebar();
          setSearchOpen(false);
        }}
      />

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        user={DEMO_USER}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
