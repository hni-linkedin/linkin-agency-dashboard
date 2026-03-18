"use client";

import { Fragment, use, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ApiError } from "@/lib/axios";
import { deleteCapture, fetchCaptures } from "@/api/captures";
import type { CaptureDocument } from "@/types/captures";
import { DropdownSelect, Checkbox, EmptyState, SkeletonBlock, Badge, RefreshDataButton } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Trash2, X } from "lucide-react";

const DEFAULT_LIMIT = 10;

const CAPTURE_PAGE_TYPE_OPTIONS = ["Posts", "About", "Network", "Viewers", "Experience"] as const;

type PaginationItem = number | "ellipsis";

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }).map((_, i) => i + 1);

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);
  for (let p = start; p <= end; p += 1) pages.add(p);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i];
    const prev = items.length ? sorted[i - 1] : null;
    if (prev != null && p - prev > 1) items.push("ellipsis");
    items.push(p);
  }
  return items;
}

function getPageTypePills(pageTypeRaw: string): string[] {
  const pageType = pageTypeRaw.trim();
  if (!pageType) return ["—"];

  // Already user-friendly labels from older/mocked UI.
  const friendly = ["Posts", "About", "Network", "Viewers", "Experience"];
  if (friendly.includes(pageType)) return [pageType];

  // Shared label used across the app for profile views.
  if (pageType === "profile_main") return ["My Profile"];

  // Analytics-style keys (e.g. analytics_posts_engagements_90d)
  if (pageType.startsWith("analytics_")) {
    const parts = pageType.split("_");
    const window = parts[parts.length - 1];
    const hasWindow = /^\d+d$/.test(window);

    let metric = "Analytics";
    if (pageType.includes("impressions")) metric = "Impression";
    if (pageType.includes("engagements")) metric = "Engagement";
    if (pageType.includes("profile_views")) metric = "Profile Views";
    if (pageType.includes("profile") && pageType.includes("views")) metric = "Profile Views";
    if (pageType.includes("audience")) metric = "Audience";
    if (pageType.includes("search_appearances")) metric = "Search";

    // Search appears as:
    // analytics_search_appearances_where
    // analytics_search_appearances_companies
    // analytics_search_appearances_titles
    // analytics_search_appearances_found_for
    if (pageType.includes("search_appearances_") && !hasWindow) {
      const tail = pageType.replace("analytics_search_appearances_", "");
      if (tail) {
        const third =
          tail === "found_for"
            ? "Found For"
            : tail
                .split("_")
                .filter(Boolean)
                .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
                .join(" ");
        return ["Analytics", "Search", third];
      }
    }

    const pills = ["Analytics", metric];
    if (hasWindow) pills.push(window);
    return pills;
  }

  // Network-style keys (e.g. network_connections)
  if (pageType.startsWith("network_")) {
    const parts = pageType.split("_");
    const metricKey = parts[1];
    const metricMap: Record<string, string> = {
      connections: "Connections",
      followers: "Followers",
      following: "Following",
    };
    return ["Network", metricMap[metricKey] ?? metricKey ?? "—"];
  }

  // Fallback: show raw string.
  return [pageType];
}

function PageTypePills({ pageType }: { pageType?: string }) {
  const pills = pageType ? getPageTypePills(pageType) : ["—"];

  const getVariant = (label: string, idx: number): "accent" | "green" | "amber" | "red" | "neutral" | "outline" => {
    // Category pill (first element)
    if (idx === 0) {
      if (label === "Analytics") return "accent";
      if (label === "Network") return "amber";
      if (label === "Search") return "amber";
      return "neutral";
    }

    // Metric pill (second element)
    if (idx === 1) {
      if (label.includes("Impression")) return "amber";
      if (label.includes("Engagement")) return "amber";
      if (label.includes("Audience")) return "accent";
      if (label.includes("Profile Views")) return "neutral";
      if (label === "Connections" || label === "Followers" || label === "Following") return "amber";
      if (label.includes("Search")) return "amber";
      return "neutral";
    }

    // Window/sub-window pill
    if (/^\d+d$/.test(label)) return "red";
    if (label === "Where") return "accent";
    if (label === "Companies") return "amber";
    if (label === "Titles") return "accent";
    if (label === "Found For") return "red";

    return "outline";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
      {pills.map((p, idx) => (
        <Fragment key={`${p}-${idx}`}>
          <Badge label={p} variant={getVariant(p, idx)} size="sm" />
          {idx < pills.length - 1 && <span style={{ color: "var(--text-muted)" }}>-</span>}
        </Fragment>
      ))}
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseSuccessToBadge(parseSuccess: boolean | undefined): { label: string; variant: "green" | "red" | "neutral" } {
  if (parseSuccess === true) return { label: "Success", variant: "green" };
  if (parseSuccess === false) return { label: "Failed", variant: "red" };
  return { label: "—", variant: "neutral" };
}

type ParseSuccessFilter = "any" | "success" | "failed";
type SortBy = "capturedAt" | "pageType" | "parseSuccess";
type SortDir = "asc" | "desc";

export default function CapturesClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);

  // Filters (UI -> API contract)
  const [pageType, setPageType] = useState<string>("");
  const [groupByPageType, setGroupByPageType] = useState<boolean>(false);
  const [latestOnly, setLatestOnly] = useState<boolean>(false);

  // Extra client-side filters (apply after fetch)
  const [parseSuccessFilter, setParseSuccessFilter] = useState<ParseSuccessFilter>("any");

  // Client-side sorting
  const [sortBy, setSortBy] = useState<SortBy>("capturedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Refresh button
  const [refreshNonce, setRefreshNonce] = useState<number>(0);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSummaryText, setDeleteSummaryText] = useState<string | null>(null);
  const [deleteCapturedAtText, setDeleteCapturedAtText] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination (offset pagination uses a 0-based pageIndex)
  const [pageIndex, setPageIndex] = useState<number>(0);

  const [items, setItems] = useState<CaptureDocument[]>([]);
  const [count, setCount] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Build filters that we will actually send to backend.
  const filtersForRequest = useMemo(() => {
    const trimmedPageType = pageType.trim();
    // Backend ignores `latestOnly` in grouped mode, so pagination should still work when `groupBy=pageType`.
    const shouldIncludePagination = groupByPageType || !latestOnly;

    return {
      pageType: trimmedPageType ? trimmedPageType : undefined,
      groupByPageType,
      latestOnly,
      // Offset pagination: backend uses offset when provided.
      offset: shouldIncludePagination ? pageIndex * DEFAULT_LIMIT : undefined,
      limit: shouldIncludePagination ? DEFAULT_LIMIT : undefined,
    };
  }, [pageType, groupByPageType, latestOnly, pageIndex]);

  useEffect(() => {
    let ignore = false;

    const id = setTimeout(() => {
      if (ignore) return;
      setStatus("loading");
      setError(null);
      setStatusCode(null);
    }, 0);

    fetchCaptures(clientId, {
      pageType: filtersForRequest.pageType,
      groupByPageType: filtersForRequest.groupByPageType,
      latestOnly: filtersForRequest.latestOnly,
      limit: filtersForRequest.limit,
      offset: filtersForRequest.offset,
    })
      .then((res) => {
        if (ignore) return;
        setItems(res.data);
        setCount(res.count);
        setStatus("success");
      })
      .catch((e) => {
        if (ignore) return;
        const msg = e instanceof ApiError ? e.message : "Something went wrong";
        const code = e instanceof ApiError ? e.statusCode : null;
        setStatusCode(code);
        setError(msg);
        setItems([]);
        setCount(0);
        setStatus("error");
      });

    return () => {
      ignore = true;
      clearTimeout(id);
    };
  }, [clientId, filtersForRequest, refreshNonce]);

  const handleRefresh = () => {
    if (status === "loading") return;
    setRefreshNonce((n) => n + 1);
  };

  const openDeleteModal = (captureId: string, summaryText: string, capturedAtText: string) => {
    if (!captureId) return;
    setDeleteTargetId(captureId);
    setDeleteError(null);
    setDeleteSummaryText(summaryText);
    setDeleteCapturedAtText(capturedAtText);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return; // don't allow closing mid-request
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeleteError(null);
    setDeleteSummaryText(null);
    setDeleteCapturedAtText(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCapture(deleteTargetId);
      setIsDeleting(false);
      closeDeleteModal();
      // Refresh list while preserving current filters.
      setRefreshNonce((n) => n + 1);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to delete capture.";
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

  // When grouped, `latestOnly` is ignored by backend, so pagination should still be available.
  const showPagination = groupByPageType || !latestOnly;
  const maxPage = Math.max(1, Math.ceil(count / DEFAULT_LIMIT));

  const displayedItems = useMemo(() => {
    const filtered = items.filter((c) => {
      const parsed = c.parseSuccess;
      if (parseSuccessFilter === "success" && parsed !== true) return false;
      if (parseSuccessFilter === "failed" && parsed !== false) return false;

      return true;
    });

    const dirFactor = sortDir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "capturedAt") {
        const ta = new Date(a.capturedAt).getTime();
        const tb = new Date(b.capturedAt).getTime();
        const va = Number.isNaN(ta) ? 0 : ta;
        const vb = Number.isNaN(tb) ? 0 : tb;
        return (va - vb) * dirFactor;
      }

      if (sortBy === "pageType") {
        return ((a.pageType ?? "").localeCompare(b.pageType ?? "")) * dirFactor;
      }

      // parseSuccess
      const sa = a.parseSuccess === true ? 1 : a.parseSuccess === false ? 0 : -1;
      const sb = b.parseSuccess === true ? 1 : b.parseSuccess === false ? 0 : -1;
      return (sa - sb) * dirFactor;
    });

    return sorted;
  }, [items, parseSuccessFilter, sortBy, sortDir]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg-size)",
              lineHeight: "var(--text-lg-line)",
              color: "var(--text-primary)",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Captures
          </h2>
          <div style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)" }}>
            {status === "loading"
              ? "Loading…"
              : `${count.toLocaleString()} capture${count === 1 ? "" : "s"}${displayedItems.length !== items.length ? ` · showing ${displayedItems.length}` : ""}`}
          </div>
        </div>

        <RefreshDataButton onClick={handleRefresh} disabled={status === "loading"} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          padding: "12px 14px",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border-subtle)",
          background: "transparent",
        }}
      >
        {/* Filters */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
            <label style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Page type
            </label>
            <DropdownSelect
              ariaLabel="Page type"
              value={pageType}
              onChange={(next) => {
                setPageType(next);
                setPageIndex(0);
              }}
              options={[
                { value: "", label: "All page types" },
                ...CAPTURE_PAGE_TYPE_OPTIONS.map((pt) => ({ value: pt, label: pt })),
              ]}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 190 }}>
            <label style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Parse
            </label>
            <DropdownSelect
              ariaLabel="Parse"
              value={parseSuccessFilter}
              onChange={(next) => setParseSuccessFilter(next as ParseSuccessFilter)}
              options={[
                { value: "any", label: "Any" },
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" },
              ]}
            />
          </div>

          <Checkbox
            checked={groupByPageType}
            onCheckedChange={(next) => {
              setGroupByPageType(next);
              setPageIndex(0);
            }}
            label="Latest Data"
          />
        </div>

        {/* Sorters */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
            <label style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Sort by
            </label>
            <DropdownSelect
              ariaLabel="Sort by"
              value={sortBy}
              onChange={(next) => setSortBy(next as SortBy)}
              options={[
                { value: "capturedAt", label: "Captured at" },
                { value: "pageType", label: "Page type" },
                { value: "parseSuccess", label: "Parse" },
              ]}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 140 }}>
            <label style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Order
            </label>
            <DropdownSelect
              ariaLabel="Order"
              value={sortDir}
              onChange={(next) => setSortDir(next as SortDir)}
              options={[
                { value: "desc", label: "Desc" },
                { value: "asc", label: "Asc" },
              ]}
            />
          </div>
        </div>
      </div>

      {status === "loading" ? (
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Capture ID", "Page type", "Captured At", "Parse", "Actions"].map(
                  (label) => (
                    <th
                      key={label}
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
                        whiteSpace: label === "Actions" ? "nowrap" : undefined,
                        width: label === "#" ? 46 : undefined,
                      }}
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: "1px dashed var(--border-subtle)" }}>
                  <td style={{ padding: "10px 12px", width: 46 }}>
                    <SkeletonBlock width={30} height={14} radius="var(--r-sm)" />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <SkeletonBlock width={160} height={14} radius="var(--r-sm)" />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <SkeletonBlock width={110} height={14} radius="var(--r-sm)" />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <SkeletonBlock width={170} height={14} radius="var(--r-sm)" />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <SkeletonBlock width={90} height={22} radius="var(--r-full)" />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <SkeletonBlock width={28} height={28} radius="var(--r-md)" />
                      <SkeletonBlock width={28} height={28} radius="var(--r-md)" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : status === "error" ? (
        <EmptyState
          variant="error"
          title={statusCode === 401 ? "Unauthorized" : "Failed to load"}
          body={error ?? "Something went wrong."}
        />
      ) : displayedItems.length === 0 ? (
        <EmptyState
          variant="filtered-empty"
          title="No captures found"
          body="Try adjusting your filters."
        />
      ) : (
        <>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "#",
                    "Capture ID",
                    "Page type",
                    "Captured At",
                    "Parse",
                    "Actions",
                  ].map((label) => (
                    <th
                      key={label}
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
                        whiteSpace: label === "Actions" ? "nowrap" : undefined,
                        width: label === "#" ? 46 : undefined,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((c, idx) => {
                  const parseBadge = parseSuccessToBadge(c.parseSuccess);
                  return (
                    <tr
                      key={c._id}
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
                      <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", width: 46 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {c._id}
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                        <PageTypePills pageType={c.pageType} />
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                        {formatDateTime(c.capturedAt)}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge label={parseBadge.label} variant={parseBadge.variant} size="sm" />
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            type="button"
                            disabled={!c.tabUrl}
                            aria-label="Open tab"
                            onClick={() => {
                              if (!c.tabUrl) return;
                              window.open(c.tabUrl, "_blank", "noreferrer");
                            }}
                            onMouseEnter={(e) => {
                              if (!c.tabUrl) return;
                              e.currentTarget.style.background = "var(--accent-dim)";
                              e.currentTarget.style.borderColor = "var(--border-accent)";
                              e.currentTarget.style.color = "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.borderColor = "var(--border-subtle)";
                              e.currentTarget.style.color = "var(--accent)";
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              borderRadius: "var(--r-md)",
                              border: "1px dashed var(--border-subtle)",
                              background: "transparent",
                              color: "var(--accent)",
                              cursor: c.tabUrl ? "pointer" : "not-allowed",
                              transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                            }}
                          >
                            <ExternalLink size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete capture"
                            disabled={isDeleting}
                            onClick={() => {
                              const summary = getPageTypePills(c.pageType ?? "").join(" - ");
                              const capturedAtText = formatDateTime(c.capturedAt);
                              openDeleteModal(c._id, summary, capturedAtText);
                            }}
                            onMouseEnter={(e) => {
                              if (isDeleting) return;
                              e.currentTarget.style.background = "var(--red-dim)";
                              e.currentTarget.style.borderColor = "var(--red-border)";
                              e.currentTarget.style.color = "var(--red)";
                            }}
                            onMouseLeave={(e) => {
                              if (isDeleting) return;
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.borderColor = "var(--border-subtle)";
                              e.currentTarget.style.color = "var(--red)";
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              borderRadius: "var(--r-md)",
                              border: "1px dashed var(--border-subtle)",
                              background: "transparent",
                              color: "var(--red)",
                              cursor: isDeleting ? "not-allowed" : "pointer",
                              transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {showPagination && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)" }}>
                Page {pageIndex + 1} of {maxPage}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setPageIndex((pi) => Math.max(0, pi - 1))}
                  disabled={pageIndex <= 0}
                  style={{
                    background: "transparent",
                    border: "1px dashed var(--border-default)",
                    borderRadius: "var(--r-sm)",
                    padding: "6px 10px",
                    cursor: pageIndex <= 0 ? "not-allowed" : "pointer",
                    opacity: pageIndex <= 0 ? 0.6 : 1,
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-2xs-size)",
                    color: "var(--text-primary)",
                  }}
                >
                  Prev
                </button>

                {getPaginationItems(pageIndex + 1, maxPage).map((item, idx) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        style={{ color: "var(--text-muted)", padding: "0 4px", fontFamily: "var(--font-data)", fontSize: "var(--text-2xs-size)" }}
                      >
                        …
                      </span>
                    );
                  }

                  const isActive = item === pageIndex + 1;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPageIndex(item - 1)}
                      disabled={isActive}
                      style={{
                        width: 32,
                        height: 28,
                        borderRadius: "var(--r-sm)",
                        border: isActive ? "1px solid var(--border-accent)" : "1px dashed var(--border-default)",
                        background: isActive ? "var(--accent-dim)" : "transparent",
                        color: isActive ? "var(--accent)" : "var(--text-primary)",
                        cursor: isActive ? "default" : "pointer",
                        opacity: isActive ? 1 : 1,
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-2xs-size)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {item}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    setPageIndex((pi) => Math.min(maxPage - 1, pi + 1))
                  }
                  disabled={pageIndex + 1 >= maxPage}
                  style={{
                    background: "transparent",
                    border: "1px dashed var(--border-default)",
                    borderRadius: "var(--r-sm)",
                    padding: "6px 10px",
                    cursor: pageIndex + 1 >= maxPage ? "not-allowed" : "pointer",
                    opacity: pageIndex + 1 >= maxPage ? 0.6 : 1,
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-2xs-size)",
                    color: "var(--text-primary)",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {typeof document !== "undefined" &&
        deleteModalOpen &&
        deleteTargetId &&
        createPortal(
          <AnimatePresence>
            {deleteModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                style={{ background: "rgba(0,0,0,0.25)" }}
                onClick={closeDeleteModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-capture-title"
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-xl shadow-xl"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px dashed var(--border-subtle)",
                      padding: "16px 20px",
                      gap: 12,
                    }}
                  >
                    <h2
                      id="delete-capture-title"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "var(--text-lg-size)",
                        lineHeight: "var(--text-lg-line)",
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      Delete capture?
                    </h2>
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      aria-label="Close"
                      disabled={isDeleting}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--r-md)",
                        border: "1px dashed transparent",
                        background: "transparent",
                        color: "var(--text-muted)",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
                      }}
                      onMouseEnter={(e) => {
                        if (isDeleting) return;
                        e.currentTarget.style.background = "var(--bg-elevated)";
                        e.currentTarget.style.borderColor = "var(--border-default)";
                        e.currentTarget.style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div style={{ padding: "16px 20px" }}>
                    <p
                      style={{
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-sm-size)",
                        color: "var(--text-muted)",
                        lineHeight: "var(--text-sm-line)",
                        margin: 0,
                      }}
                    >
                      This will delete the capture for{" "}
                      <span style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {deleteSummaryText ?? "—"}
                      </span>{" "}
                      captured on{" "}
                      <span style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {deleteCapturedAtText ?? "—"}
                      </span>
                      . This action can&apos;t be undone.
                    </p>
                    {deleteError && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 12px",
                          borderRadius: "var(--r-md)",
                          border: "1px dashed var(--red-border)",
                          background: "var(--red-dim)",
                          color: "var(--red)",
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-sm-size)",
                        }}
                      >
                        {deleteError}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 12,
                      padding: "16px 20px",
                      borderTop: "1px dashed var(--border-subtle)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      disabled={isDeleting}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--r-md)",
                        border: "1px dashed var(--border-default)",
                        background: "transparent",
                        color: "var(--text-primary)",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-sm-size)",
                        transition: "background 150ms ease, border-color 150ms ease",
                        opacity: isDeleting ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (isDeleting) return;
                        e.currentTarget.style.background = "var(--bg-elevated)";
                        e.currentTarget.style.borderColor = "var(--border-default)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--r-md)",
                        border: "1px solid var(--red-border)",
                        background: "var(--red-dim)",
                        color: "var(--red)",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-data)",
                        fontSize: "var(--text-sm-size)",
                        fontWeight: 600,
                        transition: "opacity 150ms ease, filter 150ms ease",
                        opacity: isDeleting ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (isDeleting) return;
                        e.currentTarget.style.filter = "brightness(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = "none";
                      }}
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

