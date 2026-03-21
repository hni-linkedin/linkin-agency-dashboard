"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fadeUp } from "@/lib/animations";

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

export function LoginForm() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await login(email.trim(), password);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      style={{
        background: "var(--bg-card)",
        border: "1px dashed var(--border-subtle)",
        borderRadius: "var(--r-md)",
        padding: "36px 32px",
      }}
    >
      <motion.form onSubmit={handleSubmit}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <HexagonIcon size={28} />
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display-outfit)",
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
        </div>

        <div style={{ marginBottom: 12 }}>
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
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={loading}
            autoComplete="email"
            required
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
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="login-password"
            style={{
              display: "block",
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
              required
              style={{
                width: "100%",
                height: 40,
                padding: "0 40px 0 12px",
                background: "var(--bg-elevated)",
                border: "1px dashed var(--border-subtle)",
                borderRadius: "var(--r-md)",
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-sm-size)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 8,
                top: 8,
                width: 24,
                height: 24,
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--red)",
                marginTop: -6,
                marginBottom: 12,
              }}
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          style={{
            width: "100%",
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "var(--accent)",
            color: "white",
            border:
              loading || !email.trim() || !password.trim()
                ? "1px dashed var(--border-subtle)"
                : "1px solid var(--accent)",
            borderRadius: "var(--r-md)",
            fontFamily: "var(--font-display-outfit)",
            fontWeight: 600,
            fontSize: "var(--text-sm-size)",
            cursor:
              loading || !email.trim() || !password.trim()
                ? "not-allowed"
                : "pointer",
            opacity: loading || !email.trim() || !password.trim() ? 0.5 : 1,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </motion.form>
    </motion.div>
  );
}
