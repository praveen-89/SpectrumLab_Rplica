"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";

type AdminTheme = "light" | "dark";
const STORAGE_KEY = "admin-theme";

// Entirely independent of the public site's theme system: a different
// localStorage key ("admin-theme" vs "theme") and a different attribute
// (data-admin-theme vs data-theme), so toggling one never affects the
// other even though both can be open in different tabs of the same browser.
function applyTheme(theme: AdminTheme) {
  document.documentElement.setAttribute("data-admin-theme", theme);
}

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<AdminTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // No stored preference yet (first visit) -> follow the OS/browser
    // setting once, then it's a plain light/dark toggle from here on.
    const stored = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the stored/system preference once on mount, same pattern as the public site's ThemeToggle
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function handleClick() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  if (!mounted) return <button type="button" className="admin-theme-toggle" aria-label="Toggle theme" />;

  const Icon = theme === "light" ? IconSun : IconMoon;

  return (
    <button
      type="button"
      className="admin-theme-toggle"
      onClick={handleClick}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <Icon size={16} />
    </button>
  );
}
