"use client";

import { Check } from "lucide-react";
import React, { useId } from "react";

export type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label: React.ReactNode;
  ariaLabel?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  ariaLabel,
}: CheckboxProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        opacity: disabled ? 0.5 : 1,
        paddingBottom: 6,
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onCheckedChange(e.target.checked)}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: "var(--r-sm)",
          border: checked ? "1px solid var(--border-accent)" : "1px solid var(--border-default)",
          background: checked ? "var(--accent-dim)" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 150ms ease, border-color 150ms ease",
        }}
      >
        {checked && (
          <Check size={14} stroke="var(--accent)" strokeWidth={3} />
        )}
      </span>

      <span
        style={{
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-sm-size)",
          color: "var(--text-primary)",
        }}
      >
        {label}
      </span>
    </label>
  );
}

