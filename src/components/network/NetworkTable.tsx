"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { ExternalLink } from "lucide-react";
import {
  fetchNetworkConnectionsPage,
  fetchNetworkFollowersPage,
  fetchNetworkFollowingPage,
} from "@/api/network";
import { ApiError } from "@/lib/axios";
import { buildNetworkBadgeSets } from "@/lib/network/badgeSets";
import type { NetworkListingRow, NetworkOverviewData, NetworkTableTab } from "@/types/network";
import { Badge, DropdownSelect, SkeletonBlock } from "@/components";
import type { DataTableColumn } from "@/components/DataTable";
import { NetworkAvatar } from "./NetworkAvatar";

const LIMIT = 50;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

type CachedPage = {
  total: number;
  rows: NetworkListingRow[];
  capturedAt: string;
};

function getPageWindow(current: number, totalPages: number): number[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 2);
  const end = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export type NetworkTableProps = {
  tab: NetworkTableTab;
  clientId: string;
  overviewData: NetworkOverviewData | null;
  overlapsOnly: boolean;
  onOverlapsOnlyChange: (next: boolean) => void;
  /** Bumps when parent refreshes — clears row cache so listings refetch. */
  refreshEpoch?: number;
};

export function NetworkTable({
  tab,
  clientId,
  overviewData,
  overlapsOnly,
  onOverlapsOnlyChange,
  refreshEpoch = 0,
}: NetworkTableProps) {
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<NetworkListingRow[]>([]);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);

  const cacheRef = useRef<
    Partial<Record<NetworkTableTab, Map<number, CachedPage>>>
  >({});

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);
  const [sort, setSort] = useState<"recent" | "name">("recent");

  const { connectionsSet, followersSet } = useMemo(
    () => buildNetworkBadgeSets(overviewData),
    [overviewData],
  );

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, overlapsOnly]);

  useEffect(() => {
    cacheRef.current = {};
  }, [clientId, refreshEpoch]);

  const fetchFn = useCallback(
    async (t: NetworkTableTab, p: number): Promise<CachedPage> => {
      if (t === "connections") {
        const res = await fetchNetworkConnectionsPage(clientId, p, LIMIT);
        return {
          total: res.total,
          rows: res.data ?? [],
          capturedAt: res.capturedAt,
        };
      }
      if (t === "followers") {
        const res = await fetchNetworkFollowersPage(clientId, p, LIMIT);
        return {
          total: res.total,
          rows: res.data ?? [],
          capturedAt: res.capturedAt,
        };
      }
      const res = await fetchNetworkFollowingPage(clientId, p, LIMIT);
      return {
        total: res.total,
        rows: res.data ?? [],
        capturedAt: res.capturedAt,
      };
    },
    [clientId],
  );

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      const map =
        cacheRef.current[tab] ??
        (() => {
          const m = new Map<number, CachedPage>();
          cacheRef.current[tab] = m;
          return m;
        })();

      const cached = map.get(page);
      if (cached) {
        if (ignore) return;
        setRows(cached.rows);
        setTotal(cached.total);
        setCapturedAt(cached.capturedAt);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const next = await fetchFn(tab, page);
        if (ignore) return;
        map.set(page, next);
        setRows(next.rows);
        setTotal(next.total);
        setCapturedAt(next.capturedAt);
      } catch (e) {
        if (ignore) return;
        const msg = e instanceof ApiError ? e.message : "Something went wrong";
        setError(msg);
        setRows([]);
        setTotal(0);
        setCapturedAt(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    void run();
    return () => {
      ignore = true;
    };
  }, [tab, page, clientId, fetchFn, refreshEpoch]);

  useEffect(() => {
    if (!tableWrapRef.current) return;
    tableWrapRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [page]);

  const filtered = useMemo(() => {
    let out = [...rows];
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.headline.toLowerCase().includes(q),
      );
    }
    if (tab === "followers" && overlapsOnly) {
      out = out.filter((r) => !connectionsSet.has(r.profileUrl));
    }
    return out;
  }, [rows, debouncedSearch, tab, overlapsOnly, connectionsSet]);

  const sortedRows = useMemo(() => {
    if (sort === "recent") return filtered;
    return [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const windowPages = getPageWindow(page, totalPages);
  const startIdx = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const endIdx = total === 0 ? 0 : Math.min(page * LIMIT, total);

  const retry = () => {
    const map = cacheRef.current[tab];
    map?.delete(page);
    setLoading(true);
    setError(null);
    void fetchFn(tab, page)
      .then((data) => {
        map?.set(page, data);
        setRows(data.rows);
        setTotal(data.total);
        setCapturedAt(data.capturedAt);
        setError(null);
      })
      .catch((e) => {
        const msg = e instanceof ApiError ? e.message : "Something went wrong";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  const columns: DataTableColumn<NetworkListingRow>[] = useMemo(
    () => [
      {
        key: "idx",
        header: "#",
        width: 48,
        render: (_row, i) => (
          <span data-tabular style={{ color: "var(--text-muted)" }}>
            {(page - 1) * LIMIT + i + 1}
          </span>
        ),
      },
      {
        key: "person",
        header: "Person",
        width: 220,
        render: (row) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NetworkAvatar name={row.name} image={row.image} />
            <span
              style={{
                fontFamily: "var(--font-display-outfit)",
                fontWeight: 600,
                fontSize: "var(--text-sm-size)",
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.name}
            </span>
          </div>
        ),
      },
      {
        key: "headline",
        header: "Headline",
        render: (row) => (
          <div
            style={{
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--text-secondary)",
            }}
          >
            {row.headline}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: 220,
        render: (row) => {
          const u = row.profileUrl;
          if (tab === "connections") {
            return (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <Badge label="Connected" variant="accent" size="sm" />
                {followersSet.has(u) && (
                  <Badge label="Follows you" variant="green" size="sm" />
                )}
              </div>
            );
          }
          if (tab === "followers") {
            const connected = connectionsSet.has(u);
            return (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {connected ? (
                  <Badge label="Connected" variant="accent" size="sm" />
                ) : (
                  <Badge label="Follows · not connected" variant="amber" size="sm" />
                )}
              </div>
            );
          }
          const followsBack = followersSet.has(u);
          return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {followsBack ? (
                <Badge label="Follows back" variant="green" size="sm" />
              ) : (
                <Badge label="No follow-back" variant="neutral" size="sm" />
              )}
            </div>
          );
        },
      },
      {
        key: "view",
        header: "View",
        width: 56,
        align: "right",
        render: (row) => (
          <a
            href={row.profileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
            aria-label={`Open profile ${row.name}`}
          >
            <ExternalLink size={16} strokeWidth={2} />
          </a>
        ),
      },
    ],
    [tab, page, connectionsSet, followersSet],
  );

  return (
    <div ref={tableWrapRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or headline…"
          aria-label="Search network list"
          style={{
            flex: "1 1 220px",
            minWidth: 180,
            maxWidth: 420,
            padding: "8px 12px",
            borderRadius: "var(--r-md)",
            border: "1px dashed var(--border-card)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-sm-size)",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {tab === "followers" && (
            <button
              type="button"
              onClick={() => onOverlapsOnlyChange(!overlapsOnly)}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--r-sm)",
                border: `1px dashed ${overlapsOnly ? "var(--amber-border)" : "var(--border-card)"}`,
                background: overlapsOnly ? "var(--amber-dim)" : "transparent",
                color: overlapsOnly ? "var(--amber)" : "var(--text-muted)",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-2xs-size)",
                cursor: "pointer",
              }}
            >
              Overlaps only
            </button>
          )}
          <DropdownSelect
            ariaLabel="Sort"
            value={sort}
            onChange={(v) => setSort(v as "recent" | "name")}
            options={[
              { value: "recent", label: "Recent" },
              { value: "name", label: "Name A–Z" },
            ]}
            containerStyle={{ width: 160, flexShrink: 0 }}
          />
        </div>
      </div>

      {capturedAt && (
        <div
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--text-2xs-size)",
            color: "var(--text-muted)",
          }}
        >
          Captured {new Date(capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      )}

      <div
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border-card)",
          borderRadius: "var(--r-md)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} height={40} radius="var(--r-md)" />
            ))}
          </div>
        ) : error ? (
          <div
            style={{
              padding: 24,
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-sm-size)",
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 12 }}>{error}</div>
            <button
              type="button"
              onClick={retry}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--r-md)",
                border: "1px dashed var(--border-accent)",
                background: "var(--accent-dim)",
                color: "var(--accent)",
                fontFamily: "var(--font-data)",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "12px 14px",
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-2xs-size)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        borderBottom: "1px dashed var(--border-subtle)",
                        textAlign: col.align ?? "left",
                        width: col.width,
                        fontWeight: 600,
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => {
                  const amberFollower =
                    tab === "followers" && !connectionsSet.has(row.profileUrl);
                  return (
                  <tr
                    key={`${row.profileUrl}-${i}`}
                    style={{
                      borderBottom: "1px dashed var(--border-subtle)",
                      background: amberFollower ? "rgba(186, 117, 23, 0.08)" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = amberFollower
                        ? "rgba(186, 117, 23, 0.12)"
                        : "var(--bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = amberFollower
                        ? "rgba(186, 117, 23, 0.08)"
                        : "transparent";
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          padding: "12px 14px",
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-sm-size)",
                          color: "var(--text-primary)",
                          textAlign: col.align ?? "left",
                        }}
                      >
                        {col.render(row, i)}
                      </td>
                    ))}
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedRows.length === 0 && !loading && (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                }}
              >
                No rows match your filters on this page.
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-xs-size)",
          color: "var(--text-muted)",
        }}
      >
        <span data-tabular>
          Showing {total === 0 ? 0 : startIdx}–{endIdx} of {total.toLocaleString()}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={pagerBtnStyle(page <= 1 || loading)}
          >
            Prev
          </button>
          {windowPages.map((p) => (
            <button
              key={p}
              type="button"
              disabled={loading}
              onClick={() => setPage(p)}
              style={{
                ...pagerBtnStyle(loading),
                ...(p === page
                  ? {
                      borderColor: "var(--border-accent)",
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                    }
                  : {}),
              }}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={pagerBtnStyle(page >= totalPages || loading)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function pagerBtnStyle(disabled: boolean): CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: "var(--r-sm)",
    border: "1px dashed var(--border-card)",
    background: "transparent",
    color: disabled ? "var(--text-disabled)" : "var(--text-secondary)",
    fontFamily: "var(--font-data)",
    fontSize: "var(--text-2xs-size)",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
