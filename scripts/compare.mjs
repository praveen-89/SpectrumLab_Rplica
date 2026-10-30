// Visual diffing tool: screenshots the original site and our local dev
// server side by side, at two widths and both themes, for manual
// comparison while matching the original's design. Dev-only.
//
// Usage: npm run compare -- / /publications/
// Requires the local dev server running at http://localhost:3000.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const ORIGINAL_BASE = "https://spectrum.ee.iisc.ac.in";
const OURS_BASE = "http://localhost:3000";
const SHOTS_DIR = join(process.cwd(), ".reference", "shots");

const VIEWPORTS = [
  { label: "1440", width: 1440, height: 900 },
  { label: "375", width: 375, height: 812 },
];
const THEMES = ["light", "dark"];

const HIDE_NEXT_DEV_INDICATOR_CSS = `
  nextjs-portal, [id*="nextjs"], [id*="next-dev"] { display: none !important; }
`;

const DISABLE_ANIMATIONS_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`;

function slugify(path) {
  if (path === "/") return "home";
  return path.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

async function shoot(browser, { site, baseUrl, path, viewport, theme }) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: theme,
  });

  // Both the original (theme.js) and ours (next-themes) read this same
  // localStorage key, so one init script sets the theme for either site.
  await context.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {
      // ignore (e.g. storage disabled)
    }
  }, theme);

  // Freezes timers (setInterval/requestAnimationFrame) so autoplay
  // carousels land on a stable frame instead of mid-transition.
  const page = await context.newPage();
  await page.clock.install();

  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS + HIDE_NEXT_DEV_INDICATOR_CSS });

  const slug = slugify(path);
  const dir = join(SHOTS_DIR, slug);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${site}-${viewport.label}-${theme}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[compare] saved ${filePath}`);

  await context.close();
}

async function run() {
  const paths = process.argv.slice(2);
  const targets = paths.length > 0 ? paths : ["/"];

  const browser = await chromium.launch();
  try {
    for (const path of targets) {
      for (const viewport of VIEWPORTS) {
        for (const theme of THEMES) {
          await shoot(browser, { site: "original", baseUrl: ORIGINAL_BASE, path, viewport, theme });
          await shoot(browser, { site: "ours", baseUrl: OURS_BASE, path, viewport, theme });
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\n--- Compare complete ---");
  console.log(`Shots saved under ${SHOTS_DIR}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
