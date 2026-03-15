"use client";

import { Avatar } from "../Avatar";

export interface ViewerRowProps {
  name: string;
  headline?: string;
  company?: string;
  date?: string;
  src?: string;
  isNew?: boolean;
}

export function ViewerRow({
  name,
  headline,
  company,
  date,
  src,
  isNew = false,
}: ViewerRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px dashed var(--border-subtle)",
        borderLeft: isNew ? "2px solid var(--accent)" : undefined,
        paddingLeft: isNew ? "10px" : undefined,
      }}
    >
      <Avatar name={name} src={src} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-sm-size)",
            fontWeight: 500,
            color: isNew ? "var(--accent)" : "var(--text-primary)",
          }}
        >
          {name}
        </div>
        {(headline != null || company != null) && (
          <div
            style={{
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: "var(--text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
              marginTop: "2px",
            }}
          >
            {headline ?? company}
          </div>
        )}
      </div>
      {date != null && (
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-2xs-size)",
            color: "var(--text-muted)",
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          {date}
        </span>
      )}
    </div>
  );
}
