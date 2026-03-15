"use client";

import { Fragment } from "react";
import { Check, Minus, AlertTriangle } from "lucide-react";
import { SkeletonBlock } from "../SkeletonBlock";

export type CaptureStatus = "captured" | "missing" | "stale";

export interface SessionInfo {
  id: string;
  number: number;
  date: string;
}

export type CaptureMatrix = Record<
  string,
  Record<string, CaptureStatus>
>;

export interface CaptureHealthGridProps {
  sessions: SessionInfo[];
  pageTypes: string[];
  data: CaptureMatrix;
  loading?: boolean;
}

const CELL_SIZE = 32;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

export function CaptureHealthGrid({
  sessions,
  pageTypes,
  data,
  loading = false,
}: CaptureHealthGridProps) {
  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `120px repeat(${sessions.length}, ${CELL_SIZE}px)`,
          gap: "4px",
          alignItems: "center",
        }}
      >
        <div />
        {sessions.map((s) => (
          <SkeletonBlock
            key={s.id}
            width={CELL_SIZE}
            height={CELL_SIZE}
            radius="var(--r-sm)"
          />
        ))}
        {pageTypes.map((pt) => (
          <Fragment key={pt}>
            <div
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-secondary)",
              }}
            >
              {pt}
            </div>
            {sessions.map((s) => (
              <SkeletonBlock
                key={`${pt}-${s.id}`}
                width={CELL_SIZE}
                height={CELL_SIZE}
                radius="var(--r-sm)"
              />
            ))}
          </Fragment>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `120px repeat(${sessions.length}, ${CELL_SIZE}px)`,
        gap: "4px",
        alignItems: "center",
      }}
    >
      <div />
      {sessions.map((s) => (
        <div
          key={s.id}
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-2xs-size)",
            color: "var(--text-muted)",
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          #{s.number}
          <br />
          {formatDate(s.date)}
        </div>
      ))}
      {pageTypes.map((pt) => (
        <Fragment key={pt}>
          <div
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: "var(--text-secondary)",
            }}
          >
            {pt}
          </div>
          {sessions.map((s) => {
            const status = data[pt]?.[s.id] ?? "missing";
            const isCaptured = status === "captured";
            const isStale = status === "stale";
            return (
              <div
                key={`${pt}-${s.id}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRadius: "var(--r-sm)",
                  background: isCaptured
                    ? "var(--green-dim)"
                    : isStale
                      ? "var(--amber-dim)"
                      : "var(--bg-elevated)",
                  border: "1px dashed",
                  borderColor: isCaptured
                    ? "var(--green-border)"
                    : isStale
                      ? "var(--amber-border)"
                      : "var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCaptured ? (
                  <Check size={14} strokeWidth={2.5} style={{ color: "var(--green)" }} />
                ) : isStale ? (
                  <AlertTriangle size={14} strokeWidth={2} style={{ color: "var(--amber)" }} />
                ) : (
                  <Minus size={14} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
