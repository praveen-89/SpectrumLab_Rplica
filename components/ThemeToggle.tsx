"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "./icons";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- documented next-themes pattern for avoiding hydration mismatch
    setMounted(true);
  }, []);

  // Avoid a hydration mismatch: the server doesn't know the stored/system
  // preference, so render a neutral placeholder until mounted on the client.
  if (!mounted) {
    return <button id="light-toggle" type="button" title="Change theme" aria-label="Toggle dark mode" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      id="light-toggle"
      type="button"
      title="Change theme"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
