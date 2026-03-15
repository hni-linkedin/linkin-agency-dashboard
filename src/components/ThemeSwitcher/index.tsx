"use client";

import { useEffect, useState } from "react";
import { IconButton } from "../IconButton";
import { Moon, Sun } from "lucide-react";
import { setTheme } from "../ThemeScript";

export function ThemeSwitcher() {
  const [theme, setThemeState] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem("theme") as "light" | "dark" | null)) || "dark";
    const resolved = stored === "light" ? "light" : "dark";
    setThemeState(resolved);
    document.documentElement.dataset.theme = resolved;
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
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
