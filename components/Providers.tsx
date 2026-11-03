"use client";

import { ThemeProvider } from "next-themes";

// Mirrors the original site's theme.js: data-theme attribute on <html>,
// "theme" localStorage key, system preference by default.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="theme" scriptProps={{ async: true }}>
      {children}
    </ThemeProvider>
  );
}
