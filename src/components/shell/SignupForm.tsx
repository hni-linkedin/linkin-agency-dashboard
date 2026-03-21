"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Divider } from "@/components";
import { Check } from "lucide-react";

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

const PERSONAL_DOMAINS = ["gmail", "yahoo", "hotmail", "outlook"];
function isPersonalEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return PERSONAL_DOMAINS.some((d) => domain.includes(d));
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0 } } },
  item: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } } },
};

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [, setNameTouched] = useState(false);
  const [, setEmailTouched] = useState(false);
  const [showPersonalCallout, setShowPersonalCallout] = useState(false);
  const [submitting] = useState(false);

  const nameValid = name.trim().length >= 2;
  const emailValid = !!email.trim();
  const canSubmit = nameValid && emailValid && !submitting;

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setShowPersonalCallout(isPersonalEmail(email));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
      style={{
        background: "var(--bg-card)",
        border: "1px dashed var(--border-subtle)",
        borderRadius: "var(--r-md)",
        padding: "36px 32px",
      }}
    >
      <motion.form
        onSubmit={(e) => e.preventDefault()}
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
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
              Create your account
            </p>
          </div>
        </motion.div>

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
            }}
          >
            <span style={{ fontSize: 18 }}>in</span>
            Continue with LinkedIn
          </button>
        </motion.div>

        <motion.div variants={stagger.item} style={{ margin: "20px 0" }}>
          <Divider label="or" spacing={0} />
        </motion.div>

        <motion.div variants={stagger.item} style={{ marginBottom: 12 }}>
          <label
            htmlFor="signup-name"
            style={{
              display: "block",
              fontFamily: "var(--font-data)",
              fontSize: "var(--text-xs-size)",
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={(e) => {
              setNameTouched(true);
              e.currentTarget.style.boxShadow = "0 0 0 0px transparent";
              if (name.trim().length >= 2) e.currentTarget.style.boxShadow = "0 0 0 1px var(--green-border)";
            }}
            placeholder="Jane Smith"
            disabled={submitting}
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
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-focus)";
            }}
          />
        </motion.div>

        <motion.div variants={stagger.item}>
          <label
            htmlFor="signup-email"
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
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (!isPersonalEmail(e.target.value)) setShowPersonalCallout(false);
            }}
            onBlur={(e) => {
              handleEmailBlur();
              if (!showPersonalCallout) e.currentTarget.style.boxShadow = "0 0 0 0px transparent";
              if (e.currentTarget.validity.valid && e.currentTarget.value) {
                e.currentTarget.style.boxShadow = "0 0 0 1px var(--green-border)";
              }
            }}
            placeholder="you@company.com"
            disabled={submitting}
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
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 1px var(--border-focus)";
            }}
          />
          {showPersonalCallout && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                overflow: "hidden",
                background: "var(--amber-dim)",
                border: "1px dashed var(--amber-border)",
                borderRadius: "var(--r-md)",
                padding: "8px 12px",
                marginTop: 8,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: "var(--text-xs-size)",
                  color: "var(--amber)",
                  margin: 0,
                }}
              >
                Using a work email gets you team features.
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={stagger.item} style={{ marginTop: 12 }}>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "var(--accent)",
              color: "white",
              border: canSubmit ? "1px solid var(--accent)" : "1px dashed var(--border-subtle)",
              borderRadius: "var(--r-md)",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-sm-size)",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.35,
              transition: "opacity 150ms ease, border 150ms ease, transform 150ms ease",
            }}
            onMouseDown={(e) => {
              if (canSubmit) e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Create account →
          </button>
        </motion.div>

        <motion.div
          variants={stagger.item}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 16,
          }}
        >
          {["Free plan · no credit card", "API key ready instantly", "100 free credits included"].map((line) => (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-data)",
                fontSize: "var(--text-xs-size)",
                color: "var(--text-muted)",
              }}
            >
              <Check size={12} style={{ color: "var(--green)", flexShrink: 0 }} />
              {line}
            </div>
          ))}
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
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Sign in →
          </Link>
        </motion.p>
      </motion.form>
    </motion.div>
  );
}
