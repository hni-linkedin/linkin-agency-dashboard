"use client";

import { useSyncExternalStore } from "react";
import { IconButton } from "../IconButton";
import { Moon, Sun } from "lucide-react";
import { setTheme, THEME_CHANGE_EVENT } from "../ThemeScript";

function getSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return (document.documentElement.dataset.theme === "light" ? "light" : "dark") as "light" | "dark";
}

function getServerSnapshot(): "light" | "dark" {
  return "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <IconButton
      icon={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      onClick={toggle}
      variant="ghost"
      tooltip={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    />
  );
}
