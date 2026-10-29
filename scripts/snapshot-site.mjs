#!/usr/bin/env node
// Dev-only crawler: snapshots the original Spectrum Lab site for reference while
// rebuilding it. Not part of the shipped app. Plain Node 22, no dependencies.

import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join, extname } from "node:path";

const BASE_URL = "https://spectrum.ee.iisc.ac.in";
const BASE_HOST = new URL(BASE_URL).host;
const REQUEST_DELAY_MS = 200;
const MAX_PAGES = 1000;

const PAGES_DIR = join(process.cwd(), ".reference", "pages");
const REFERENCE_ASSETS_DIR = join(process.cwd(), ".reference", "assets");
const CDN_DIR = join(process.cwd(), ".reference", "assets", "cdn");
const PUBLIC_DIR = join(process.cwd(), "public");
const PAGES_JSON = join(process.cwd(), ".reference", "pages.json");

// --external-css: also download cross-host <link rel="stylesheet"> files
// (CDN-hosted CSS like MDB UI Kit, Swiper) into .reference/assets/cdn/ for
// study. Off by default since these aren't part of the site itself.
const DOWNLOAD_EXTERNAL_CSS = process.argv.includes("--external-css");
const externalCssQueue = [];
const queuedExternalCss = new Set();
let externalCssDownloaded = 0;
let externalCssFailed = 0;

const TEXT_ASSET_EXTENSIONS = new Set([".css", ".js"]);
const SKIPPED_PROTOCOLS = ["mailto:", "tel:", "javascript:"];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pageQueue = ["/"];
const visitedPages = new Set();
const pageRecords = [];

const assetQueue = [];
const queuedAssets = new Set();
let assetsDownloaded = 0;
let assetsSkipped = 0;
let assetsFailed = 0;

function isSameHost(url) {
  return url.host === BASE_HOST;
}

function isSkippedHref(href) {
  if (!href) return true;
  const trimmed = href.trim();
  if (trimmed === "" || trimmed.startsWith("#")) return true;
  return SKIPPED_PROTOCOLS.some((proto) => trimmed.startsWith(proto));
}

function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl);
  } catch {
    return null;
  }
}

function normalizePagePathname(pathname) {
  if (extname(pathname)) return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function pageFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  return join(PAGES_DIR, decoded, "index.html");
}

function assetFilePath(url) {
  const decodedPath = decodeURIComponent(url.pathname);
  const ext = extname(decodedPath).toLowerCase();
  const root = TEXT_ASSET_EXTENSIONS.has(ext) ? REFERENCE_ASSETS_DIR : PUBLIC_DIR;
  return join(root, decodedPath);
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function extractAttr(tag, attrName) {
  const match = tag.match(new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? match[1] : null;
}

function extractLinkRels(html) {
  const hrefs = [];
  const linkTagPattern = /<link\s+[^>]*>/gi;
  for (const tagMatch of html.matchAll(linkTagPattern)) {
    const tag = tagMatch[0];
    const rel = extractAttr(tag, "rel") ?? "";
    const href = extractAttr(tag, "href");
    if (!href) continue;
    if (/stylesheet|icon|manifest/i.test(rel)) hrefs.push(href);
  }
  return hrefs;
}

function extractExternalStylesheetUrls(html, baseUrl) {
  const urls = [];
  const linkTagPattern = /<link\s+[^>]*>/gi;
  for (const tagMatch of html.matchAll(linkTagPattern)) {
    const tag = tagMatch[0];
    const rel = extractAttr(tag, "rel") ?? "";
    const href = extractAttr(tag, "href");
    if (!href || !/stylesheet/i.test(rel)) continue;
    const resolved = resolveUrl(href, baseUrl);
    if (resolved && !isSameHost(resolved)) urls.push(resolved);
  }
  return urls;
}

function extractSrcsetUrls(srcset) {
  return srcset
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      const descriptorMatch = trimmed.match(/^(.*)\s+\d+(?:\.\d+)?[wx]$/);
      return descriptorMatch ? descriptorMatch[1] : trimmed;
    })
    .filter(Boolean);
}

function extractImageUrls(html) {
  const urls = [];
  const imgTagPattern = /<(?:img|source)\s+[^>]*>/gi;
  for (const tagMatch of html.matchAll(imgTagPattern)) {
    const tag = tagMatch[0];
    const src = extractAttr(tag, "src");
    if (src) urls.push(src);
    const srcset = extractAttr(tag, "srcset");
    if (srcset) urls.push(...extractSrcsetUrls(srcset));
  }
  return urls;
}

function extractAnchorHrefs(html) {
  const hrefs = [];
  const anchorPattern = /<a\s+[^>]*>/gi;
  for (const tagMatch of html.matchAll(anchorPattern)) {
    const href = extractAttr(tagMatch[0], "href");
    if (href) hrefs.push(href);
  }
  return hrefs;
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : "";
}

function extractCssUrls(css) {
  const urls = [];
  const urlPattern = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  for (const match of css.matchAll(urlPattern)) {
    urls.push(match[1]);
  }
  return urls;
}

function queueAsset(href, baseUrl) {
  if (isSkippedHref(href)) return;
  if (href.startsWith("data:")) return;
  const resolved = resolveUrl(href, baseUrl);
  if (!resolved || !isSameHost(resolved)) return;
  resolved.hash = "";
  const key = resolved.toString();
  if (queuedAssets.has(key)) return;
  queuedAssets.add(key);
  assetQueue.push(resolved);
}

async function fetchPage(pathname) {
  const pageUrl = new URL(pathname, BASE_URL);
  console.log(`[page] fetching ${pageUrl.pathname}`);
  await delay(REQUEST_DELAY_MS);

  let response;
  try {
    response = await fetch(pageUrl);
  } catch (error) {
    console.log(`[page] FAILED ${pageUrl.pathname}: ${error.message}`);
    return;
  }
  if (!response.ok) {
    console.log(`[page] FAILED ${pageUrl.pathname}: HTTP ${response.status}`);
    return;
  }

  const finalUrl = new URL(response.url);
  if (!isSameHost(finalUrl)) return;

  const html = await response.text();
  const filePath = pageFilePath(finalUrl.pathname);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf-8");

  pageRecords.push({ url: finalUrl.pathname, title: extractTitle(html) });

  for (const href of extractAnchorHrefs(html)) {
    if (isSkippedHref(href)) continue;
    const resolved = resolveUrl(href, finalUrl);
    if (!resolved || !isSameHost(resolved)) continue;
    const normalizedPathname = normalizePagePathname(resolved.pathname);
    if (extname(normalizedPathname)) {
      queueAsset(href, finalUrl);
      continue;
    }
    if (visitedPages.has(normalizedPathname)) continue;
    visitedPages.add(normalizedPathname);
    pageQueue.push(normalizedPathname);
  }

  for (const href of extractImageUrls(html)) queueAsset(href, finalUrl);
  for (const href of extractLinkRels(html)) queueAsset(href, finalUrl);

  if (DOWNLOAD_EXTERNAL_CSS) {
    for (const url of extractExternalStylesheetUrls(html, finalUrl)) {
      const key = url.toString();
      if (queuedExternalCss.has(key)) continue;
      queuedExternalCss.add(key);
      externalCssQueue.push(url);
    }
  }
}

function externalCssFilePath(url) {
  const decodedPath = decodeURIComponent(url.pathname);
  return join(CDN_DIR, url.host, decodedPath);
}

async function downloadExternalCss(url) {
  const filePath = externalCssFilePath(url);
  if (await fileExists(filePath)) {
    console.log(`[cdn-css] skip (exists) ${url}`);
    return;
  }

  console.log(`[cdn-css] downloading ${url}`);
  await delay(REQUEST_DELAY_MS);

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    externalCssFailed += 1;
    console.log(`[cdn-css] FAILED ${url}: ${error.message}`);
    return;
  }
  if (!response.ok) {
    externalCssFailed += 1;
    console.log(`[cdn-css] FAILED ${url}: HTTP ${response.status}`);
    return;
  }

  const text = await response.text();
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf-8");
  externalCssDownloaded += 1;
}

async function downloadAsset(url) {
  const filePath = assetFilePath(url);

  if (await fileExists(filePath)) {
    assetsSkipped += 1;
    console.log(`[asset] skip (exists) ${url.pathname}`);
    return;
  }

  console.log(`[asset] downloading ${url.pathname}`);
  await delay(REQUEST_DELAY_MS);

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    assetsFailed += 1;
    console.log(`[asset] FAILED ${url.pathname}: ${error.message}`);
    return;
  }
  if (!response.ok) {
    assetsFailed += 1;
    console.log(`[asset] FAILED ${url.pathname}: HTTP ${response.status}`);
    return;
  }

  const ext = extname(decodeURIComponent(url.pathname)).toLowerCase();
  await mkdir(dirname(filePath), { recursive: true });

  if (TEXT_ASSET_EXTENSIONS.has(ext)) {
    const text = await response.text();
    await writeFile(filePath, text, "utf-8");
    if (ext === ".css") {
      for (const href of extractCssUrls(text)) queueAsset(href, url);
    }
  } else {
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(filePath, buffer);
  }

  assetsDownloaded += 1;
}

async function run() {
  visitedPages.add("/");

  let pagesCrawled = 0;
  while (pageQueue.length > 0 && pagesCrawled < MAX_PAGES) {
    const pathname = pageQueue.shift();
    await fetchPage(pathname);
    pagesCrawled += 1;
  }

  while (assetQueue.length > 0) {
    const url = assetQueue.shift();
    await downloadAsset(url);
  }

  while (externalCssQueue.length > 0) {
    const url = externalCssQueue.shift();
    await downloadExternalCss(url);
  }

  await mkdir(dirname(PAGES_JSON), { recursive: true });
  await writeFile(PAGES_JSON, JSON.stringify(pageRecords, null, 2), "utf-8");

  console.log("\n--- Snapshot complete ---");
  console.log(`Pages crawled: ${pagesCrawled}`);
  console.log(`Assets downloaded: ${assetsDownloaded}`);
  console.log(`Assets skipped (already present): ${assetsSkipped}`);
  console.log(`Assets failed: ${assetsFailed}`);
  if (DOWNLOAD_EXTERNAL_CSS) {
    console.log(`External CSS downloaded: ${externalCssDownloaded}`);
    console.log(`External CSS failed: ${externalCssFailed}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
