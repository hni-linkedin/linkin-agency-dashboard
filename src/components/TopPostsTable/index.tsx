"use client";

import { Badge } from "../Badge";
import { SortButton } from "../SortButton";
import { SkeletonBlock } from "../SkeletonBlock";

export type PostType = "text" | "image" | "video" | "document" | "poll";

export interface PostRow {
  rank: number;
  content: string;
  date: string;
  type: PostType;
  impressions: number;
  engagements: number;
  comments: number;
  er: number;
}

export type SortCol = "impressions" | "engagements" | "comments" | "er";

export interface TopPostsTableProps {
  posts: PostRow[];
  sortBy?: SortCol;
  onSortChange?: (col: string) => void;
  loading?: boolean;
  limit?: number;
}

const TYPE_LABELS: Record<PostType, string> = {
  text: "Text",
  image: "Image",
  video: "Video",
  document: "Document",
  poll: "Poll",
};

export function TopPostsTable({
  posts,
  sortBy = "impressions",
  onSortChange,
  loading = false,
  limit = 5,
}: TopPostsTableProps) {
  const displayPosts = posts.slice(0, limit);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} height={40} width="100%" radius="var(--r-sm)" />
        ))}
      </div>
    );
  }

  const sortDir = "desc" as "asc" | "desc";

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "8px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                lineHeight: "var(--text-2xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
                width: "32px",
              }}
            >
              #
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                lineHeight: "var(--text-2xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
                maxWidth: "240px",
              }}
            >
              Post
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                lineHeight: "var(--text-2xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
              }}
            >
              Type
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "8px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                lineHeight: "var(--text-2xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
              }}
            >
              <SortButton
                active={sortBy === "impressions"}
                direction={sortDir}
                onClick={() => onSortChange?.("impressions")}
              >
                Impressions
              </SortButton>
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "8px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                lineHeight: "var(--text-2xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
              }}
            >
              <SortButton
                active={sortBy === "engagements"}
                direction={sortDir}
                onClick={() => onSortChange?.("engagements")}
              >
                Engagements
              </SortButton>
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "8px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                lineHeight: "var(--text-2xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
              }}
            >
              <SortButton
                active={sortBy === "comments"}
                direction={sortDir}
                onClick={() => onSortChange?.("comments")}
              >
                Comments
              </SortButton>
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "8px 12px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                lineHeight: "var(--text-2xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
              }}
            >
              <SortButton
                active={sortBy === "er"}
                direction={sortDir}
                onClick={() => onSortChange?.("er")}
              >
                ER
              </SortButton>
            </th>
          </tr>
        </thead>
        <tbody>
          {displayPosts.map((row) => (
            <tr
              key={row.rank}
              style={{
                borderBottom: "1px dashed var(--border-subtle)",
                transition: "background 100ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <td
                style={{
                  padding: "10px 12px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-muted)",
                  fontVariantNumeric: "tabular-nums",
                  width: "32px",
                }}
              >
                {row.rank}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  maxWidth: "240px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.content.length > 60
                  ? `${row.content.slice(0, 60)}…`
                  : row.content}
              </td>
              <td style={{ padding: "10px 12px" }}>
                <Badge label={TYPE_LABELS[row.type]} variant="neutral" size="sm" />
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {row.impressions.toLocaleString()}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {row.engagements.toLocaleString()}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {row.comments.toLocaleString()}
              </td>
              <td
                style={{
                  padding: "10px 12px",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  fontVariantNumeric: "tabular-nums",
                  textAlign: "right",
                }}
              >
                {(row.er * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
