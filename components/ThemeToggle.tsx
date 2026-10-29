"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, SystemIcon } from "./icons";

// Matches the original's theme.js cycle order exactly: system -> light ->
// dark -> system. next-themes is configured with storageKey="theme" in
// Providers.tsx, the same localStorage key theme.js uses.
function nextSetting(current: "system" | "light" | "dark") {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}

// The original renders this twice — once in the desktop nav, once as a
// separate button in the mobile header bar (id="mobile-light-toggle") —
// so the id is a prop rather than hardcoded, to keep ids unique.
export default function ThemeToggle({ id = "light-toggle" }: { id?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- documented next-themes pattern for avoiding hydration mismatch
    setMounted(true);
  }, []);

  // Avoid a hydration mismatch: the server doesn't know the stored/system
  // preference, so render a neutral placeholder until mounted on the client.
  if (!mounted) {
    return <button id={id} type="button" title="Change theme" aria-label="Toggle dark mode" />;
  }

  const current = theme === "light" || theme === "dark" ? theme : "system";

  return (
    <button
      id={id}
      type="button"
      title="Change theme"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(nextSetting(current))}
    >
      {current === "system" && <SystemIcon />}
      {current === "light" && <SunIcon />}
      {current === "dark" && <MoonIcon />}
    </button>
  );
}
