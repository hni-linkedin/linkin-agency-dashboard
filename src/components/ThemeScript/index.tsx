"use client";

import { useEffect } from "react";

const STORAGE_KEY = "theme";

export function ThemeScript() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null;
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
    }
  }, []);
  return null;
}

export function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (_) {}
}

export function getTheme(): "light" | "dark" {
  return (document.documentElement.dataset.theme === "light" ? "light" : "dark") as "light" | "dark";
}
