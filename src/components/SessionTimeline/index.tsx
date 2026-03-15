"use client";

import { motion } from "framer-motion";

export interface TimelineSession {
  id: string;
  number: number;
  date: string;
  captureCount: number;
  status: "complete" | "partial" | "failed";
  notes?: string;
}

export interface SessionTimelineProps {
  sessions: TimelineSession[];
  activeId?: string;
}

const STATUS_COLOR = {
  complete: "var(--green)",
  partial: "var(--amber)",
  failed: "var(--red)",
} as const;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function SessionTimeline({
  sessions,
  activeId,
}: SessionTimelineProps) {
  return (
    <div style={{ position: "relative", paddingLeft: "24px" }}>
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          left: "4px",
          top: "4px",
          bottom: "4px",
          width: "1px",
          background: "var(--border-default)",
          transformOrigin: "top",
        }}
      />
      {sessions.map((s, i) => {
        const isActive = s.id === activeId;
        const dotColor = STATUS_COLOR[s.status];
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: "relative",
              paddingBottom: "20px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "-24px",
                top: "2px",
                width: "10px",
                height: "10px",
                borderRadius: "var(--r-full)",
                background: dotColor,
                border: isActive ? "2px solid var(--accent)" : "none",
                boxSizing: "content-box",
                transform: isActive ? "scale(1.4)" : "scale(1)",
                transformOrigin: "center",
                transition: "transform 200ms ease, border 200ms ease",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "var(--text-sm-size)",
                  lineHeight: "var(--text-sm-line)",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                #{s.number}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-xs-size)",
                  color: "var(--text-muted)",
                }}
              >
                {formatDate(s.date)}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {s.captureCount} capture{s.captureCount !== 1 ? "s" : ""}
            </div>
            {s.notes && (
              <div
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-xs-size)",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  marginTop: "4px",
                }}
              >
                {s.notes}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
