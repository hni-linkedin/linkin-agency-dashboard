"use client";

import type { ReactNode } from "react";

type ColumnAlign = "left" | "right" | "center";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: ColumnAlign;
  width?: number | string;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
  render: (row: T, rowIndex: number) => ReactNode;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T, rowIndex: number) => string;
  minWidth?: number;
  rowHover?: boolean;
};

const BASE_HEADER_STYLE: React.CSSProperties = {
  padding: "12px 14px",
  fontFamily: "var(--font-data)",
  fontSize: "var(--text-2xs-size)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  borderBottom: "1px dashed var(--border-subtle)",
  fontWeight: 600,
};

const BASE_CELL_STYLE: React.CSSProperties = {
  padding: "12px 14px",
  fontFamily: "var(--font-data)",
  fontSize: "var(--text-sm-size)",
  color: "var(--text-primary)",
};

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  minWidth = 760,
  rowHover = true,
}: DataTableProps<T>) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth }}>
        <thead>
          <tr>
            {columns.map((col, colIndex) => (
              <th
                key={`${colIndex}:${col.key}`}
                style={{
                  ...BASE_HEADER_STYLE,
                  textAlign: col.align ?? "left",
                  width: col.width,
                  ...col.headerStyle,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={`${rowIndex}:${String(getRowKey(row, rowIndex) ?? "")}`}
              style={{
                borderBottom: "1px dashed var(--border-subtle)",
                transition: rowHover ? "background 100ms ease" : undefined,
              }}
              onMouseEnter={(e) => {
                if (!rowHover) return;
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                if (!rowHover) return;
                e.currentTarget.style.background = "transparent";
              }}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={`${rowIndex}:${colIndex}:${col.key}`}
                  style={{
                    ...BASE_CELL_STYLE,
                    textAlign: col.align ?? "left",
                    ...col.cellStyle,
                  }}
                >
                  {col.render(row, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

