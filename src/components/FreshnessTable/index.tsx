"use client";

export type FreshnessStatus = "overdue" | "due" | "fresh" | "missing";

export interface FreshnessTableRow {
  id: string;
  label: string;
  status: FreshnessStatus;
  capturedAt: string | null;
  daysUntilDue?: number;
}

export interface FreshnessTableProps {
  items: FreshnessTableRow[];
  /** sm = compact, md = default larger text and padding */
  size?: "sm" | "md";
}

function getDaysSince(capturedAt: string): number {
  const then = new Date(capturedAt).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (24 * 60 * 60 * 1000));
}

function formatDetails(row: FreshnessTableRow): string {
  if (row.status === "fresh" && row.capturedAt) {
    const days = getDaysSince(row.capturedAt);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }
  if (row.status === "due") return "Capture today";
  if (row.status === "overdue" && row.daysUntilDue != null) return `${row.daysUntilDue} days late`;
  if (row.status === "missing") return "—";
  return "—";
}

function statusLabel(status: FreshnessStatus): string {
  switch (status) {
    case "overdue":
      return "Overdue";
    case "due":
      return "Due";
    case "fresh":
      return "Fresh";
    case "missing":
      return "Not captured";
    default:
      return "—";
  }
}

function statusColor(status: FreshnessStatus): string {
  if (status === "overdue" || status === "due") return "var(--red)";
  if (status === "fresh") return "var(--green)";
  return "var(--text-muted)";
}

const SIZE_STYLES = {
  sm: {
    headerPadding: "8px 12px",
    headerFontSize: "var(--text-2xs-size)",
    cellPadding: "8px 12px",
    cellFontSize: "var(--text-sm-size)",
  },
  md: {
    headerPadding: "12px 20px",
    headerFontSize: "var(--text-xs-size)",
    cellPadding: "12px 20px",
    cellFontSize: "var(--text-base-size)",
  },
} as const;

export function FreshnessTable({ items, size = "md" }: FreshnessTableProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: styles.headerPadding,
                fontFamily: "var(--font-data)",
                fontSize: styles.headerFontSize,
                lineHeight: "var(--text-xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
                fontWeight: 500,
              }}
            >
              Page type
            </th>
            <th
              style={{
                textAlign: "left",
                padding: styles.headerPadding,
                fontFamily: "var(--font-data)",
                fontSize: styles.headerFontSize,
                lineHeight: "var(--text-xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
                fontWeight: 500,
              }}
            >
              Status
            </th>
            <th
              style={{
                textAlign: "left",
                padding: styles.headerPadding,
                fontFamily: "var(--font-data)",
                fontSize: styles.headerFontSize,
                lineHeight: "var(--text-xs-line)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                borderBottom: "1px dashed var(--border-subtle)",
                fontWeight: 500,
              }}
            >
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr
              key={row.id}
              style={{ borderBottom: "1px dashed var(--border-subtle)" }}
            >
              <td
                style={{
                  padding: styles.cellPadding,
                  fontFamily: "var(--font-data)",
                  fontSize: styles.cellFontSize,
                  lineHeight: "var(--text-base-line)",
                  color: "var(--text-primary)",
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  padding: styles.cellPadding,
                  fontFamily: "var(--font-data)",
                  fontSize: styles.cellFontSize,
                  lineHeight: "var(--text-base-line)",
                  color: statusColor(row.status),
                }}
              >
                {statusLabel(row.status)}
              </td>
              <td
                style={{
                  padding: styles.cellPadding,
                  fontFamily: "var(--font-data)",
                  fontSize: styles.cellFontSize,
                  lineHeight: "var(--text-base-line)",
                  color: "var(--text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatDetails(row)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
