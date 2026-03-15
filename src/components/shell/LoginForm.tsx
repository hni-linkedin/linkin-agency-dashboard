"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Divider } from "@/components";
import { Mail, Loader2 } from "lucide-react";

function HexagonIcon({ size = 28 }: { size?: number }) {
  const s = size;
  const r = s / 2;
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${r + r * Math.cos(angle)},${r + r * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round">
      <polygon points={points} />
    </svg>
  );
}

const stagger = {
  container: {
    hidden: { opacity: 0, y: -8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0 },
    },
  },
  item: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } } },
};

type Phase = "idle" | "submitting" | "sent" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendSecs, setResendSecs] = useState(0);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendCountdown = useCallback(() => {
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    setResendSecs(60);
    resendIntervalRef.current = setInterval(() => {
      setResendSecs((s) => {
        if (s <= 1) {
          if (resendIntervalRef.current) {
            clearInterval(resendIntervalRef.current);
            resendIntervalRef.current = null;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setPhase("submitting");
    setErrorMsg("");
    try {
      await new Promise((r) => setTimeout(r, 800));
      setPhase("sent");
      startResendCountdown();
    } catch {
      setPhase("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  };

  const handleWrongEmail = () => {
    setPhase("idle");
    setEmail("");
    setErrorMsg("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "var(--bg-card)",
        border: "1px dashed var(--border-subtle)",
        borderRadius: "var(--r-md)",
        padding: "36px 32px",
      }}
    >
      <AnimatePresence mode="wait">
        {phase === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ marginBottom: "16px", color: "var(--accent)" }}>
              <Mail size={32} strokeWidth={1.5} />
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "var(--text-md-size)",
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              We sent a link to{" "}
              <span style={{ color: "var(--accent)" }}>{email}</span>
            </p>
            <p
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
                marginBottom: "16px",
              }}
            >
              {resendSecs > 0 ? (
                `Resend in 0:${String(resendSecs).padStart(2, "0")}`
              ) : (
                <button
                  type="button"
                  onClick={() => startResendCountdown()}
                  style={{
                    font: "inherit",
                    color: "var(--accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Resend →
                </button>
              )}
            </p>
            <button
              type="button"
              onClick={handleWrongEmail}
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Wrong email?
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            variants={stagger.container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSubmit}
          >
            {/* Header */}
            <motion.div variants={stagger.item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
              <HexagonIcon size={28} />
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "var(--text-2xl-size)",
                    lineHeight: "var(--text-2xl-line)",
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  LinkinAgency
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-data)",
                    fontSize: "var(--text-sm-size)",
                    color: "var(--text-muted)",
                    margin: "4px 0 0",
                  }}
                >
                  Sign in to your account
                </p>
              </div>
            </motion.div>

            {/* OAuth */}
            <motion.div variants={stagger.item} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                style={{
                  width: "100%",
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--r-md)",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "box-shadow 150ms ease, background 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-default)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: 18 }}>G</span>
                Continue with Google
              </button>
              <button
                type="button"
                style={{
                  width: "100%",
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-default)",
                  borderRadius: "var(--r-md)",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  opacity: phase === "submitting" ? 0.4 : 1,
                  transition: "opacity 150ms ease",
                }}
              >
                <span style={{ fontSize: 18 }}>in</span>
                Continue with LinkedIn
              </button>
            </motion.div>

            <motion.div variants={stagger.item} style={{ margin: "20px 0" }}>
              <Divider label="or" spacing={0} />
            </motion.div>

            {/* Email */}
            <motion.div
              variants={stagger.item}
              animate={phase === "error" ? { x: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-xs-size)",
                  color: "var(--text-muted)",
                  marginBottom: 6,
                }}
              >
                Work email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                disabled={phase === "submitting"}
                autoComplete="email"
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-subtle)",
                  borderRadius: "var(--r-md)",
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-sm-size)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "box-shadow 150ms ease",
                  boxShadow: phase === "error" ? "0 0 0 1px var(--red-border)" : "0 0 0 0px transparent",
                }}
                onFocus={(e) => {
                  if (phase !== "error") e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-focus)";
                }}
                onBlur={(e) => {
                  if (phase !== "error") {
                    e.currentTarget.style.boxShadow = "0 0 0 0px transparent";
                    if (e.currentTarget.validity.valid && e.currentTarget.value) {
                      e.currentTarget.style.boxShadow = "0 0 0 1px var(--green-border)";
                    }
                  }
                }}
              />
              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      fontFamily: "var(--font-data)",
                      fontSize: "var(--text-xs-size)",
                      color: "var(--red)",
                      marginTop: 6,
                    }}
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={stagger.item} style={{ marginTop: 12 }}>
              <button
                type="submit"
                disabled={phase === "submitting" || !email.trim()}
                style={{
                  width: "100%",
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "var(--accent)",
                  color: "white",
                  border: phase === "submitting" || !email.trim() ? "1px dashed var(--border-subtle)" : "1px solid var(--accent)",
                  borderRadius: "var(--r-md)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "var(--text-sm-size)",
                  cursor: phase === "submitting" || !email.trim() ? "not-allowed" : "pointer",
                  opacity: phase === "submitting" || !email.trim() ? 0.35 : 1,
                  transition: "opacity 150ms ease, border 150ms ease, transform 150ms ease",
                }}
                onMouseDown={(e) => {
                  if (phase !== "submitting" && email.trim()) e.currentTarget.style.transform = "scale(0.97)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {phase === "submitting" ? (
                  <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />
                ) : null}
                Sign in with email
              </button>
            </motion.div>

            <motion.p
              variants={stagger.item}
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
                textAlign: "center",
                marginTop: 24,
              }}
            >
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "var(--accent)", textDecoration: "none" }}>
                Sign up →
              </Link>
            </motion.p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
