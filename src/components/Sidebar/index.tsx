"use client";

import Link from "next/link";
import { ClientSwitcher } from "../ClientSwitcher";
import { FreshnessIndicator } from "../FreshnessIndicator";

export interface ClientInfo {
  id: string;
  name: string;
  sector?: string;
  logoUrl?: string;
}

export interface FreshnessStatus {
  label: string;
  status: "fresh" | "due" | "overdue";
  lastCapture?: string;
}

export interface SidebarProps {
  client: ClientInfo;
  clients: ClientInfo[];
  onClientChange: (id: string) => void;
  activeRoute: string;
  captureHealth?: FreshnessStatus[];
}

const NAV_GROUPS = [
  {
    label: "ANALYTICS",
    links: [
      { id: "/overview", label: "Overview" },
      { id: "/posts", label: "Posts" },
      { id: "/network", label: "Network" },
      { id: "/viewers", label: "Viewers" },
    ],
  },
  {
    label: "OPERATIONS",
    links: [
      { id: "/captures", label: "Captures" },
      { id: "/sessions", label: "Sessions" },
      { id: "/timeline", label: "Timeline" },
    ],
  },
  {
    label: "ACCOUNT",
    links: [
      { id: "/settings", label: "Settings" },
      { id: "/billing", label: "Billing" },
    ],
  },
];

export function Sidebar({
  client,
  clients,
  onClientChange,
  activeRoute,
  captureHealth = [],
}: SidebarProps) {
  const handleClientChange = (c: ClientInfo) => {
    onClientChange(c.id);
  };

  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        background: "var(--bg-surface)",
        borderRight: "1px dashed var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ padding: "20px 16px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl-size)",
            lineHeight: "var(--text-xl-line)",
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
        >
          LA-DB
        </div>
        <ClientSwitcher
          current={client}
          clients={clients}
          onChange={handleClientChange}
        />
      </div>

      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: "16px" }}>
            <div
              style={{
                padding: "4px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: "4px",
              }}
            >
              {group.label}
            </div>
            {group.links.map((link) => {
              const isActive = activeRoute === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.id}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-sm-size)",
                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                    background: isActive ? "var(--bg-card)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    textDecoration: "none",
                    transition: "color 120ms ease, background 120ms ease, border-color 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.background = "var(--bg-elevated)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {captureHealth.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px dashed var(--border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {captureHealth.map((item) => (
            <FreshnessIndicator
              key={item.label}
              label={item.label}
              status={item.status}
              lastCapture={item.lastCapture}
              compact
            />
          ))}
        </div>
      )}

      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px dashed var(--border-subtle)",
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-xs-size)",
          color: "var(--text-muted)",
        }}
      >
        User · Sign out
      </div>
    </aside>
  );
}
