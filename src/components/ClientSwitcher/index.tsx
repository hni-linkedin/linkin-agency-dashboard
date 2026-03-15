"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface ClientInfo {
  id: string;
  name: string;
  sector?: string;
  logoUrl?: string;
}

export interface ClientSwitcherProps {
  current: ClientInfo;
  clients: ClientInfo[];
  onChange: (client: ClientInfo) => void;
}

export function ClientSwitcher({
  current,
  clients,
  onChange,
}: ClientSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          padding: "10px 12px",
          borderRadius: "var(--r-md)",
          background: "var(--bg-elevated)",
          border: "1px dashed var(--border-subtle)",
          boxShadow: "0 0 0 0px transparent",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-sm-size)",
          fontWeight: 500,
          color: "var(--text-primary)",
          cursor: "pointer",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-default)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.boxShadow = "0 0 0 0px transparent";
          }
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {current.name}
          </div>
          {current.sector != null && (
            <div
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {current.sector}
            </div>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} strokeWidth={2} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              background: "var(--bg-overlay)",
              border: "1px dashed var(--border-default)",
              boxShadow: "0 0 0 1px var(--border-default), 0 8px 32px rgba(0,0,0,0.4)",
              borderRadius: "var(--r-md)",
              maxHeight: "300px",
              overflowY: "auto",
              zIndex: 100,
            }}
          >
            {clients.map((client) => {
              const isActive = client.id === current.id;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    onChange(client);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    background: isActive ? "var(--accent-muted)" : "transparent",
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-sm-size)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 100ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--bg-card)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div>{client.name}</div>
                  {client.sector != null && (
                    <div
                      style={{
                        fontSize: "var(--text-xs-size)",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {client.sector}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
