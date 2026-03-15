"use client";

import { motion } from "framer-motion";

export interface Tab {
  id: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pill";
}

export function TabBar({
  tabs,
  activeId,
  onChange,
  variant = "underline",
}: TabBarProps) {
  if (variant === "pill") {
    return (
      <div
        style={{
          display: "inline-flex",
          background: "var(--bg-elevated)",
          borderRadius: "var(--r-md)",
          padding: "3px",
          gap: 0,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--r-md)",
                border: "none",
                background: isActive ? "var(--bg-card)" : "transparent",
                boxShadow: isActive ? "0 0 0 1px var(--border-default)" : "none",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "var(--text-sm-size)",
                lineHeight: "var(--text-sm-line)",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                cursor: tab.disabled ? "not-allowed" : "pointer",
                opacity: tab.disabled ? 0.5 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 100ms ease, background 100ms ease",
              }}
              onMouseEnter={(e) => {
                if (tab.disabled) return;
                if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {tab.label}
              {tab.badge != null && (
                <span
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-2xs-size)",
                    padding: "1px 5px",
                    borderRadius: "var(--r-sm)",
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 0,
        position: "relative",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            style={{
              padding: "8px 16px",
              border: "none",
              background: "transparent",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-sm-size)",
              lineHeight: "var(--text-sm-line)",
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              cursor: tab.disabled ? "not-allowed" : "pointer",
              opacity: tab.disabled ? 0.5 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 100ms ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (tab.disabled) return;
              if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {tab.label}
            {tab.badge != null && (
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-2xs-size)",
                  padding: "1px 5px",
                  borderRadius: "var(--r-sm)",
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                }}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "var(--accent)",
                  borderRadius: "var(--r-sm)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
