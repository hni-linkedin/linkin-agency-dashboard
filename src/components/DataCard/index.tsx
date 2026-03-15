"use client";

import type { ReactNode } from "react";
import { SkeletonBlock } from "../SkeletonBlock";

export interface DataCardProps {
  title?: string;
  badge?: ReactNode;
  action?: ReactNode;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  noPadding?: boolean;
  hover?: boolean;
}

export function DataCard({
  title,
  badge,
  action,
  description,
  children,
  loading = false,
  noPadding = false,
  hover = false,
}: DataCardProps) {
  const hasHeader = title != null || badge != null || action != null || description != null;

  return (
    <article
      data-hover={hover ? "true" : undefined}
      style={{
        background: "var(--bg-card)",
        border: "1px dashed var(--border-subtle)",
        boxShadow: "0 0 0 0px transparent",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
        transition: hover
          ? "border-color 150ms ease, box-shadow 150ms ease"
          : undefined,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--border-default)";
              e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-default)";
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.boxShadow = "0 0 0 0px transparent";
            }
          : undefined
      }
    >
      {hasHeader && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              padding: noPadding ? "16px 24px 0" : "20px 24px 0",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {title != null && (
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "var(--text-md-size)",
                    lineHeight: "var(--text-md-line)",
                    color: "var(--text-primary)",
                  }}
                >
                  {title}
                </h3>
              )}
              {description != null && (
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-sm-size)",
                    lineHeight: "var(--text-sm-line)",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {badge}
              {action}
            </div>
          </div>
          <div
            style={{
              height: "0.5px",
              background: "var(--border-default)",
              marginTop: "16px",
            }}
          />
        </>
      )}
      <div
        style={{
          padding: noPadding ? 0 : "20px 24px",
        }}
      >
        {loading ? (
          <SkeletonBlock lines={3} lineSpacing={10} height={16} />
        ) : (
          children
        )}
      </div>
    </article>
  );
}
