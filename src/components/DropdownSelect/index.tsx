"use client";

import { ChevronDown } from "lucide-react";
import React from "react";

export type DropdownOption = {
  value: string;
  label: React.ReactNode;
};

export type DropdownSelectProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  containerStyle?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
};

export function DropdownSelect({
  value,
  options,
  onChange,
  disabled,
  ariaLabel,
  containerStyle,
  selectStyle,
}: DropdownSelectProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        ...containerStyle,
      }}
    >
      <select
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "transparent",
          border: "1px dashed var(--border-default)",
          borderRadius: "var(--r-md)",
          padding: "10px 36px 10px 12px",
          fontFamily: "var(--font-data)",
          fontSize: "var(--text-sm-size)",
          color: "var(--text-primary)",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          boxSizing: "border-box",
          cursor: disabled ? "not-allowed" : "pointer",
          ...selectStyle,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <span
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronDown size={16} />
      </span>
    </div>
  );
}

