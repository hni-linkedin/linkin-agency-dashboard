"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { managerApi } from "@/lib/api";
import { ApiError } from "@/lib/axios";
import { Badge, DataTable, type DataTableColumn, EmptyState, RefreshDataButton, SkeletonBlock } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Plus, SquareArrowOutUpRight, X } from "lucide-react";

type ClientItem = {
  /** Route segment: `cli_…` from API, not Mongo `_id` */
  clientId: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

type CreatedCredentials = { email: string; password: string } | null;

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

export default function ClientsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ClientItem[]>([]);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    let ignore = false;
    const id = setTimeout(() => {
      setStatus("loading");
      setError(null);
      managerApi
        .listClients()
        .then((res) => {
          if (ignore) return;
          const raw = Array.isArray(res.clients) ? res.clients : [];
          const mapped: ClientItem[] = raw.map((c) => {
            const clientId = c.clientId ?? c.id ?? c._id ?? "";
            return {
              clientId,
              email: c.email,
              name: c.name ?? "—",
              isActive: c.isActive ?? true,
              createdAt: c.createdAt ?? "",
            };
          });
          setItems(mapped);
          setStatus("success");
        })
        .catch((e) => {
          if (ignore) return;
          setError(e instanceof ApiError ? e.message : "Failed to load clients.");
          setItems([]);
          setStatus("error");
        });
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(id);
    };
  }, [refreshNonce]);

  const openCreateModal = () => {
    setCreateError(null);
    setCreatedCredentials(null);
    setCopiedPassword(false);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreating) return;
    setCreateModalOpen(false);
    setCreateEmail("");
    setCreateName("");
    setCreateError(null);
    setCreatedCredentials(null);
    setCopiedPassword(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    if (!createEmail.trim() || !createName.trim()) {
      setCreateError("Client name and email are required.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setCopiedPassword(false);
    try {
      const res = await managerApi.createClient(createEmail.trim(), createName.trim());
      if (res.credentials?.password && res.credentials?.email) {
        setCreatedCredentials({
          email: res.credentials.email,
          password: res.credentials.password,
        });
      } else {
        setCreatedCredentials(null);
      }
      // refresh list to show newly created client
      setRefreshNonce((n) => n + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create client.");
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
      setCreateError("Could not copy password. Please copy manually.");
    }
  };

  const columns: DataTableColumn<ClientItem>[] = useMemo(
    () => [
      { key: "sno", header: "#", width: 48, cellStyle: { color: "var(--text-muted)" }, render: (_r, i) => i + 1 },
      {
        key: "clientId",
        header: "Client ID",
        width: 220,
        cellStyle: { color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs-size)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
        render: (r) => (
          <span title={r.clientId || undefined}>{r.clientId || "—"}</span>
        ),
      },
      { key: "name", header: "Name", width: 180, render: (r) => r.name },
      { key: "email", header: "Email", width: 240, cellStyle: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, render: (r) => <span title={r.email}>{r.email}</span> },
      { key: "status", header: "Status", width: 120, render: (r) => <Badge label={r.isActive ? "Active" : "Inactive"} variant={r.isActive ? "green" : "red"} size="sm" /> },
      { key: "createdAt", header: "Created At", width: 170, cellStyle: { color: "var(--text-secondary)" }, render: (r) => (r.createdAt ? formatDateTime(r.createdAt) : "—") },
      {
        key: "actions",
        header: "Actions",
        width: 88,
        align: "center",
        headerStyle: { whiteSpace: "nowrap" },
        render: (r) => (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {r.clientId ? (
              <Link
                href={`/dashboard/${r.clientId}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open client dashboard (${r.name})`}
                title="Open client dashboard in new tab"
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
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  borderRadius: "var(--r-md)",
                  border: "1px dashed var(--border-subtle)",
                  background: "transparent",
                  color: "var(--accent)",
                  cursor: "pointer",
                  transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                  textDecoration: "none",
                }}
              >
                <SquareArrowOutUpRight size={15} aria-hidden />
              </Link>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs-size)" }} title="Missing id in API response">
                —
              </span>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  if (status === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SkeletonBlock width={180} height={20} radius="var(--r-sm)" />
        <div style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-card)", borderRadius: "var(--r-md)", padding: 14 }}>
          <SkeletonBlock width="100%" height={16} radius="var(--r-sm)" lines={8} lineSpacing={14} />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return <EmptyState variant="error" title="Failed to load clients" body={error ?? "Something went wrong."} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-lg-size)", color: "var(--text-primary)" }}>Clients</h2>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", color: "var(--text-muted)" }}>
            Manager can create and manage clients.
          </p>
        </div>
        <RefreshDataButton onClick={openCreateModal} label="Create Client" icon={<Plus size={14} />} />
      </div>

      {items.length === 0 ? (
        <EmptyState variant="filtered-empty" title="No clients found" body="Create your first client to get started." />
      ) : (
        <div style={{ border: "1px dashed var(--border-card)", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--bg-surface)" }}>
          <DataTable data={items} columns={columns} getRowKey={(row) => row.clientId} minWidth={1080} rowHover />
        </div>
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                style={{ background: "rgba(0,0,0,0.25)" }}
                onClick={closeCreateModal}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-xl shadow-xl"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px dashed var(--border-subtle)", padding: "16px 20px" }}>
                    <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-lg-size)", color: "var(--text-primary)" }}>Create client</h2>
                    <button type="button" onClick={closeCreateModal} disabled={isCreating} style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-md)", border: "1px dashed transparent", background: "transparent", color: "var(--text-muted)", cursor: isCreating ? "not-allowed" : "pointer" }}>
                      <X size={22} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateClient} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <input value={createName} onChange={(e) => setCreateName(e.target.value)} disabled={isCreating} placeholder="Client name" style={{ width: "100%", height: 40, padding: "0 12px", background: "var(--bg-elevated)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", color: "var(--text-primary)", fontFamily: "var(--font-data)" }} />
                    <input value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} disabled={isCreating} type="email" placeholder="client@company.com" style={{ width: "100%", height: 40, padding: "0 12px", background: "var(--bg-elevated)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--r-md)", color: "var(--text-primary)", fontFamily: "var(--font-data)" }} />

                    {createdCredentials && (
                      <div style={{ border: "1px dashed var(--accent-border)", background: "var(--accent-dim)", borderRadius: "var(--r-md)", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-size)", color: "var(--text-secondary)" }}>One-time credentials (copy now)</div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs-size)", color: "var(--text-primary)" }}>
                          <span>Email</span>
                          <span>{createdCredentials.email}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs-size)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {createdCredentials.password}
                          </span>
                          <button type="button" onClick={copyPassword} style={{ width: 28, height: 28, borderRadius: "var(--r-sm)", border: "1px dashed var(--border-accent)", background: "transparent", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                            {copiedPassword ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {createError && <div style={{ border: "1px dashed var(--red-border)", background: "var(--red-dim)", borderRadius: "var(--r-md)", padding: "10px 12px", color: "var(--red)", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)" }}>{createError}</div>}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, paddingTop: 6 }}>
                      <button type="button" onClick={closeCreateModal} disabled={isCreating} style={{ padding: "10px 14px", borderRadius: "var(--r-md)", border: "1px dashed var(--border-default)", background: "transparent", color: "var(--text-primary)", cursor: isCreating ? "not-allowed" : "pointer", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", opacity: isCreating ? 0.6 : 1 }}>Cancel</button>
                      <button type="submit" disabled={isCreating} style={{ padding: "10px 14px", borderRadius: "var(--r-md)", border: "1px solid var(--accent-border)", background: "var(--accent-dim)", color: "var(--accent)", cursor: isCreating ? "not-allowed" : "pointer", fontFamily: "var(--font-data)", fontSize: "var(--text-sm-size)", fontWeight: 600, opacity: isCreating ? 0.7 : 1 }}>{isCreating ? "Creating…" : "Create"}</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

