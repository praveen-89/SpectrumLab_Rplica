// Shared helpers for the one-off content importers in scripts/import/.
// Dev-only: reads from .reference/ (the crawled site snapshot) and writes
// into /content and /data. Not part of the shipped app.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { load } from "cheerio";
import TurndownService from "turndown";

export const REFERENCE_PAGES_DIR = join(process.cwd(), ".reference", "pages");
export const CONTENT_DIR = join(process.cwd(), "content");
export const DATA_DIR = join(process.cwd(), "data");

export async function loadPage(relativePath) {
  const html = await readFile(join(REFERENCE_PAGES_DIR, relativePath, "index.html"), "utf-8");
  return load(html);
}

const turndown = new TurndownService({ headingStyle: "atx", emDelimiter: "_" });

/** Converts an HTML fragment to Markdown, rewriting absolute site links to root-relative paths. */
export function htmlToMarkdown(html) {
  if (!html) return "";
  const rewritten = html.replace(/href="https?:\/\/(www\.)?spectrum\.ee\.iisc\.ac\.in/g, 'href="');
  return turndown.turndown(rewritten).trim();
}

/** Removes decorative icon-font <i> elements (fa-/ti-/ai- prefixed classes) from a cheerio selection. */
export function stripIcons($, selection) {
  selection.find('i[class*="fa-"], i[class*="ti-"], i[class*="ai-"]').remove();
  return selection;
}

function frontMatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      const entries = Object.entries(value).filter(([, v]) => v);
      if (entries.length === 0) continue;
      lines.push(`${key}:`);
      for (const [subKey, subValue] of entries) {
        lines.push(`  ${subKey}: ${JSON.stringify(subValue)}`);
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

export async function writeMarkdownFile(filePath, data, body) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, frontMatter(data) + body.trim() + "\n", "utf-8");
}

export async function writeJsonFile(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
