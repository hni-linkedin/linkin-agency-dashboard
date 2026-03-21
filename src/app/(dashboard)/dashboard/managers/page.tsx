"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { adminApi } from "@/lib/api";
import { ApiError } from "@/lib/axios";
import { Badge, DataTable, type DataTableColumn, DropdownSelect, EmptyState, RefreshDataButton, SkeletonBlock } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Pencil, Plus, Trash2, X } from "lucide-react";

type ManagerItem = {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  clientsCount: number;
};

type ManagersResponse = {
  managers: ManagerItem[];
};
type CreatedCredentials = {
  email: string;
  password: string;
} | null;

type StatusFilter = "all" | "active" | "inactive";
type SortBy = "createdAt" | "email" | "clientsCount";
type SortDir = "asc" | "desc";
type PaginationItem = number | "ellipsis";

const PAGE_SIZE = 10;

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

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = new Set<number>([1, totalPages]);
  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);

  for (let p = start; p <= end; p += 1) pages.add(p);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;
    if (prev != null && p - prev > 1) items.push("ellipsis");
    items.push(p);
  }
  return items;
}

export default function ManagersPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [items, setItems] = useState<ManagerItem[]>([]);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagerItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const openCreateModal = () => {
    setCreateError(null);
    setCreatedCredentials(null);
    setCopiedPassword(false);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreating) return;
    setCreateModalOpen(false);
    setCreateError(null);
    setCreateEmail("");
    setCreatedCredentials(null);
    setCopiedPassword(false);
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);
    setCreateError(null);
    setCopiedPassword(false);
    try {
      const res = await adminApi.createManager(createEmail);
      setCreatedCredentials({
        email: res.credentials.email,
        password: res.credentials.password,
      });
      // no page reload here by request
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to create manager.";
      setCreateError(msg);
      setCreatedCredentials(null);
    } finally {
      setIsCreating(false);
    }
  };

  const copyPassword = async () => {
    const pwd = createdCredentials?.password;
    if (!pwd) return;
    try {
      await navigator.clipboard.writeText(pwd);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 1400);
    } catch {
      setCreateError("Could not copy password. Please copy it manually.");
    }
  };

  const openDeleteModal = (manager: ManagerItem) => {
    setDeleteTarget(manager);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await adminApi.deleteManager(deleteTarget.id);
      closeDeleteModal();
      setRefreshNonce((n) => n + 1);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to delete manager.";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const id = setTimeout(() => {
      setStatus("loading");
      setError(null);
      setStatusCode(null);

      adminApi
        .listManagers()
        .then((res) => {
          if (ignore) return;
          const data = (res as ManagersResponse).managers ?? [];
          setItems(Array.isArray(data) ? data : []);
          setStatus("success");
        })
        .catch((e) => {
          if (ignore) return;
          const message = e instanceof ApiError ? e.message : "Failed to load managers.";
          const code = e instanceof ApiError ? e.statusCode : null;
          setError(message);
          setStatusCode(code);
          setItems([]);
          setStatus("error");
        });
    }, 0);

    return () => {
      ignore = true;
      clearTimeout(id);
    };
  }, [refreshNonce]);

  const processed = useMemo(() => {
    let arr = [...items];

    if (statusFilter !== "all") {
      arr = arr.filter((m) => (statusFilter === "active" ? m.isActive : !m.isActive));
    }

    arr.sort((a, b) => {
      if (sortBy === "createdAt") {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return sortDir === "asc" ? ta - tb : tb - ta;
      }
      if (sortBy === "email") {
        const cmp = a.email.localeCompare(b.email);
        return sortDir === "asc" ? cmp : -cmp;
      }
      const cmp = a.clientsCount - b.clientsCount;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [items, statusFilter, sortBy, sortDir]);

  const totalRows = processed.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const start = safePageIndex * PAGE_SIZE;
  const pagedRows = processed.slice(start, start + PAGE_SIZE);
  const pageItems = getPaginationItems(safePageIndex + 1, totalPages);
  const tableColumns: DataTableColumn<ManagerItem>[] = [
    {
      key: "serial",
      header: "#",
      width: 48,
      cellStyle: { color: "var(--text-muted)" },
      render: (_, idx) => start + idx + 1,
    },
    {
      key: "managerId",
      header: "Manager ID",
      width: 220,
      cellStyle: {
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs-size)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      render: (m) => <span title={m.id}>{m.id}</span>,
    },
    {
      key: "email",
      header: "Email",
      width: 240,
      cellStyle: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      render: (m) => <span title={m.email}>{m.email}</span>,
    },
    {
      key: "status",
      header: "Status",
      width: 120,
      render: (m) => (
        <Badge
          label={m.isActive ? "Active" : "Inactive"}
          variant={m.isActive ? "green" : "red"}
          size="sm"
        />
      ),
    },
    {
      key: "clients",
      header: "Clients",
      align: "left",
      width: 90,
      render: (m) => (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Badge label={String(m.clientsCount)} variant="accent" size="sm" />
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      width: 170,
      cellStyle: { color: "var(--text-secondary)" },
      render: (m) => formatDateTime(m.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      width: 96,
      render: (m) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <button
            type="button"
            aria-label={`Edit ${m.email}`}
            title="Edit manager"
            onClick={() => window.alert(`Edit manager (${m.email}) will be wired next.`)}
            onMouseEnter={(e) => {
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
              borderRadius: "var(--r-sm)",
              border: "1px dashed var(--border-subtle)",
              background: "transparent",
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${m.email}`}
            title="Delete manager"
            disabled={isDeleting}
            onClick={() => openDeleteModal(m)}
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
              borderRadius: "var(--r-sm)",
              border: "1px dashed var(--border-subtle)",
              background: "transparent",
              color: "var(--red)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (status === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SkeletonBlock width={170} height={20} radius="var(--r-sm)" />
            <SkeletonBlock width={260} height={12} radius="var(--r-sm)" />
          </div>
          <SkeletonBlock width={120} height={32} radius="var(--r-md)" />
        </div>
        <SkeletonBlock width="100%" height={46} radius="var(--r-md)" />
        <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-card)", borderRadius: "var(--r-md)", padding: 14 }}>
          <SkeletonBlock width="100%" height={16} radius="var(--r-sm)" lines={10} lineSpacing={14} />
        </div>
      </div>
    );
  }

  if (status === "error") {
    if (statusCode === 401) {
      return (
        <EmptyState
          variant="error"
          title="Unauthorized"
          body="Missing or invalid token. Please login again."
          action={{ label: "Retry", onClick: () => setRefreshNonce((n) => n + 1) }}
        />
      );
    }
    if (statusCode === 403) {
      return (
        <EmptyState
          variant="error"
          title="Forbidden"
          body={error ?? "You are not allowed to view managers."}
          action={{ label: "Retry", onClick: () => setRefreshNonce((n) => n + 1) }}
        />
      );
    }
    return (
      <EmptyState
        variant="error"
        title="Failed to load managers"
        body={error ?? "Something went wrong."}
        action={{ label: "Retry", onClick: () => setRefreshNonce((n) => n + 1) }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg-size)",
              lineHeight: "var(--text-lg-line)",
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            Managers
          </h2>
          <p style={{ margin: 0, fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)" }}>
            Admin users can manage active managers and client ownership.
          </p>
        </div>

        <RefreshDataButton
          onClick={openCreateModal}
          label="Create Manager"
          icon={<Plus size={14} />}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <DropdownSelect
          ariaLabel="Filter by manager status"
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v as StatusFilter);
            setPageIndex(0);
          }}
          options={[
            { value: "all", label: "Status: All" },
            { value: "active", label: "Status: Active" },
            { value: "inactive", label: "Status: Inactive" },
          ]}
        />
        <DropdownSelect
          ariaLabel="Sort managers by"
          value={sortBy}
          onChange={(v) => {
            setSortBy(v as SortBy);
            setPageIndex(0);
          }}
          options={[
            { value: "createdAt", label: "Sort: Created at" },
            { value: "email", label: "Sort: Email" },
            { value: "clientsCount", label: "Sort: Clients count" },
          ]}
        />
        <DropdownSelect
          ariaLabel="Sort direction"
          value={sortDir}
          onChange={(v) => {
            setSortDir(v as SortDir);
            setPageIndex(0);
          }}
          options={[
            { value: "desc", label: "Direction: Desc" },
            { value: "asc", label: "Direction: Asc" },
          ]}
        />
      </div>

      {totalRows === 0 ? (
        <EmptyState
          variant="filtered-empty"
          title="No managers found"
          body="Try changing filters or create a manager."
        />
      ) : (
        <>
          <div
            style={{
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--r-md)",
              overflow: "hidden",
              background: "var(--bg-surface)",
            }}
          >
            <DataTable
              data={pagedRows}
              columns={tableColumns}
              getRowKey={(row) => row.id}
              minWidth={900}
              rowHover={false}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={safePageIndex === 0}
              style={{
                border: "1px dashed var(--border-default)",
                background: "transparent",
                color: safePageIndex === 0 ? "var(--text-disabled)" : "var(--text-primary)",
                borderRadius: "var(--r-md)",
                padding: "6px 10px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                cursor: safePageIndex === 0 ? "not-allowed" : "pointer",
              }}
            >
              Prev
            </button>

            {pageItems.map((item, idx) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} style={{ color: "var(--text-muted)", padding: "0 4px" }}>
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPageIndex(item - 1)}
                  style={{
                    minWidth: 30,
                    height: 30,
                    borderRadius: "var(--r-md)",
                    border: `1px dashed ${item - 1 === safePageIndex ? "var(--accent-border)" : "var(--border-default)"}`,
                    background: item - 1 === safePageIndex ? "var(--accent-dim)" : "transparent",
                    color: item - 1 === safePageIndex ? "var(--accent)" : "var(--text-primary)",
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-xs-size)",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePageIndex >= totalPages - 1}
              style={{
                border: "1px dashed var(--border-default)",
                background: "transparent",
                color: safePageIndex >= totalPages - 1 ? "var(--text-disabled)" : "var(--text-primary)",
                borderRadius: "var(--r-md)",
                padding: "6px 10px",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                cursor: safePageIndex >= totalPages - 1 ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
      {typeof document !== "undefined" &&
        createModalOpen &&
        createPortal(
          <AnimatePresence>
            {createModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                style={{ background: "rgba(0,0,0,0.25)" }}
                onClick={closeCreateModal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-manager-title"
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
                      id="create-manager-title"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "var(--text-lg-size)",
                        lineHeight: "var(--text-lg-line)",
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      Create manager
                    </h2>
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      aria-label="Close"
                      disabled={isCreating}
                      style={{
                        width: 36,
                        height: 36,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        borderRadius: "var(--r-md)",
                        border: "1px dashed transparent",
                        background: "transparent",
                        color: "var(--text-muted)",
                        cursor: isCreating ? "not-allowed" : "pointer",
                        transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
                      }}
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateManager} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label
                        htmlFor="create-manager-email"
                        style={{
                          display: "block",
                          marginBottom: 6,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-xs-size)",
                        }}
                      >
                        Manager email (optional)
                      </label>
                      <input
                        id="create-manager-email"
                        type="email"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        placeholder="manager@company.com"
                        disabled={isCreating}
                        style={{
                          width: "100%",
                          height: 40,
                          padding: "0 12px",
                          background: "var(--bg-elevated)",
                          border: "1px dashed var(--border-subtle)",
                          borderRadius: "var(--r-md)",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-sm-size)",
                          outline: "none",
                        }}
                      />
                    </div>

                    {createdCredentials && (
                      <div
                        style={{
                          border: "1px dashed var(--accent-border)",
                          background: "var(--accent-dim)",
                          borderRadius: "var(--r-md)",
                          padding: "10px 12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-secondary)" }}>
                          One-time credentials (copy now)
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs-size)", color: "var(--text-primary)" }}>
                          <span>Email</span>
                          <span>{createdCredentials.email}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs-size)", color: "var(--text-primary)" }}>
                              Password
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs-size)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {createdCredentials.password}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={copyPassword}
                            aria-label="Copy password"
                            title="Copy password"
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "var(--r-sm)",
                              border: "1px dashed var(--border-accent)",
                              background: "transparent",
                              color: "var(--accent)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            {copiedPassword ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {createError && (
                      <div
                        style={{
                          border: "1px dashed var(--red-border)",
                          background: "var(--red-dim)",
                          borderRadius: "var(--r-md)",
                          padding: "10px 12px",
                          color: "var(--red)",
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-sm-size)",
                        }}
                      >
                        {createError}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 12,
                        paddingTop: 6,
                      }}
                    >
                      <button
                        type="button"
                        onClick={closeCreateModal}
                        disabled={isCreating}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "var(--r-md)",
                          border: "1px dashed var(--border-default)",
                          background: "transparent",
                          color: "var(--text-primary)",
                          cursor: isCreating ? "not-allowed" : "pointer",
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-sm-size)",
                          opacity: isCreating ? 0.6 : 1,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreating}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "var(--r-md)",
                          border: "1px solid var(--accent-border)",
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          cursor: isCreating ? "not-allowed" : "pointer",
                          fontFamily: "var(--font-data)",
                          fontSize: "var(--text-sm-size)",
                          fontWeight: 600,
                          opacity: isCreating ? 0.7 : 1,
                        }}
                      >
                        {isCreating ? "Creating…" : "Create"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      {typeof document !== "undefined" &&
        deleteModalOpen &&
        deleteTarget &&
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
                aria-labelledby="delete-manager-title"
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
                      id="delete-manager-title"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "var(--text-lg-size)",
                        lineHeight: "var(--text-lg-line)",
                        color: "var(--text-primary)",
                        margin: 0,
                      }}
                    >
                      Delete manager?
                    </h2>
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      aria-label="Close"
                      disabled={isDeleting}
                      style={{
                        width: 36,
                        height: 36,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
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
                      This will deactivate the manager{" "}
                      <span style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {deleteTarget.email}
                      </span>
                      {" "}created on{" "}
                      <span style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                        {formatDateTime(deleteTarget.createdAt)}
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

