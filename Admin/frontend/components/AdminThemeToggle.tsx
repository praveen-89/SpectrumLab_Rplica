"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";

type AdminTheme = "light" | "dark" | "system";
const STORAGE_KEY = "admin-theme";

// Entirely independent of the public site's theme system: a different
// localStorage key ("admin-theme" vs "theme") and a different attribute
// (data-admin-theme vs data-theme), so toggling one never affects the
// other even though both can be open in different tabs of the same browser.
function applyTheme(theme: AdminTheme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-admin-theme");
  else root.setAttribute("data-admin-theme", theme);
}

function nextTheme(current: AdminTheme): AdminTheme {
  if (current === "light") return "dark";
  if (current === "dark") return "system";
  return "light";
}

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<AdminTheme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as AdminTheme | null) ?? "system";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the stored preference once on mount, same pattern as the public site's ThemeToggle
    setTheme(stored);
    applyTheme(stored);
    setMounted(true);
  }, []);

  function handleClick() {
    const next = nextTheme(theme);
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  if (!mounted) return <button type="button" className="admin-theme-toggle" aria-label="Toggle theme" />;

  const Icon = theme === "light" ? IconSun : theme === "dark" ? IconMoon : IconDeviceDesktop;

  return (
    <button type="button" className="admin-theme-toggle" onClick={handleClick} aria-label={`Theme: ${theme}`} title={`Theme: ${theme}`}>
      <Icon size={16} />
    </button>
  );
}
