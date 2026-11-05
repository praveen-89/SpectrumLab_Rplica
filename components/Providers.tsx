"use client";

import { ThemeProvider } from "next-themes";

// Mirrors the original site's theme.js: data-theme attribute on <html>.
// Unlike the original, visitors default to light regardless of OS/browser
// preference (explicit request) — the toggle's "system" option is still
// available and still works (enableSystem stays on) for anyone who picks
// it manually. storageKey is bumped to "theme-v2": next-themes only
// applies defaultTheme when nothing is stored yet, so anyone who loaded
// this site before this change (and so has an old "theme" value saved,
// e.g. "system") would otherwise keep seeing their old resolved theme
// forever despite the new default — the bumped key makes every browser
// start fresh under the new default once, while still remembering
// whatever they pick afterward.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem storageKey="theme-v2" scriptProps={{ async: true }}>
      {children}
    </ThemeProvider>
  );
}
