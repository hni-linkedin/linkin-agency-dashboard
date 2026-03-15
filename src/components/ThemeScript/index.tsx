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

export const THEME_CHANGE_EVENT = "themechange";

export function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
}

export function getTheme(): "light" | "dark" {
  return (document.documentElement.dataset.theme === "light" ? "light" : "dark") as "light" | "dark";
}
