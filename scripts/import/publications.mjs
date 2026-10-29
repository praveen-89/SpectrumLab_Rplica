// Extracts every publication from the crawled publications page. The
// original renders each entry's full BibTeX inline (in a hidden
// `.bibtex-export-data` div) — that's the clean, parseable text this
// script uses as the base, augmented with custom fields (abbr, abstract,
// url, code, article_page) the BibTeX itself doesn't carry but the HTML
// does, mirroring how al-folio's own papers.bib stores them.

import { join } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { loadPage, htmlToMarkdown, stripIcons, writeJsonFile, CONTENT_DIR, DATA_DIR } from "./_shared.mjs";

const OUT_PATH = join(CONTENT_DIR, "papers.bib");
const COAUTHORS_PATH = join(DATA_DIR, "coauthors.json");

function extractCoauthors($) {
  // itemprop="author" sits directly on the <a> for most authors, but on a
  // wrapping <em> for the director (rendered in italics) — handle both.
  const coauthors = {};
  $('[itemprop="author"]').each((_, el) => {
    const node = $(el);
    const anchor = node.is("a") ? node : node.find("a").first();
    if (anchor.length === 0) return;
    const href = anchor.attr("href");
    const name = node.text().replace(/\s+/g, " ").trim();
    if (href && name) coauthors[name] = href;
  });
  return coauthors;
}

function extractAbbr($, item) {
  const text = item.find(".abbr abbr").first().text().trim();
  return text || undefined;
}

function extractAbstract($, item) {
  const node = item.find(".abstract.hidden").first();
  if (node.length === 0) return undefined;
  stripIcons($, node);
  const markdown = htmlToMarkdown(node.html() ?? "");
  return markdown || undefined;
}

function extractLinks($, item) {
  const links = { url: undefined, code: undefined, articlePage: undefined };
  item.find(".links a[role=button]").each((_, el) => {
    const a = $(el);
    if (a.hasClass("bibtex") || a.hasClass("bibtex-export") || a.hasClass("abstract")) return;
    const href = a.attr("href");
    if (!href) return;
    const text = a.text().trim();
    if (href.startsWith("/")) {
      links.articlePage = href;
    } else if (text === "Code" || href.includes("github.com")) {
      links.code = href;
    } else if (a.attr("itemprop") === "url") {
      links.url = href;
    }
  });
  return links;
}

function injectCustomFields(rawBibtex, fields) {
  const toAdd = Object.entries(fields).filter(([, value]) => value);
  if (toAdd.length === 0) return rawBibtex;

  const trimmed = rawBibtex.trim();
  const closingBraceIndex = trimmed.lastIndexOf("}");
  // BibTeX tolerates balanced nested braces in a field value (that's how
  // "\mathbf{+0.14}" survives parsing), so values are inserted as-is.
  const body = trimmed.slice(0, closingBraceIndex).replace(/,?\s*$/, "");
  const extraLines = toAdd.map(([key, value]) => `  ${key} = {${value}}`).join(",\n");
  return `${body},\n${extraLines}\n}`;
}

async function run() {
  const $ = await loadPage("publications");
  const items = $(".row.pub-item");

  let withAbbr = 0;
  let withAbstract = 0;
  let withUrl = 0;
  let withCode = 0;
  let withArticlePage = 0;

  const entries = items
    .map((_, el) => {
      const item = $(el);
      const exportData = item.find(".bibtex-export-data").first();
      if (exportData.length === 0) return null;

      const rawBibtex = exportData.text().trim();
      const abbr = extractAbbr($, item);
      const abstract = extractAbstract($, item);
      const links = extractLinks($, item);

      if (abbr) withAbbr += 1;
      if (abstract) withAbstract += 1;
      if (links.url) withUrl += 1;
      if (links.code) withCode += 1;
      if (links.articlePage) withArticlePage += 1;

      return injectCustomFields(rawBibtex, {
        abbr,
        // Doubled so a literal single backslash survives the bibtex
        // parser's verbatim-field tokenizer, which otherwise eats one
        // level of backslash from LaTeX-looking text (e.g. "\mathbf" in
        // inline math) even in verbatim mode — see lib/content/publications.ts.
        abstract: abstract?.replace(/\\/g, "\\\\"),
        html: links.url,
        code: links.code,
        article_page: links.articlePage,
      });
    })
    .get()
    .filter(Boolean);

  await mkdir(CONTENT_DIR, { recursive: true });
  await writeFile(OUT_PATH, entries.join("\n\n") + "\n", "utf-8");

  console.log(`Wrote ${entries.length} publications to ${OUT_PATH}`);
  console.log(`  abbr: ${withAbbr}, abstract: ${withAbstract}, url: ${withUrl}, code: ${withCode}, article_page: ${withArticlePage}`);

  const coauthors = extractCoauthors($);
  await writeJsonFile(COAUTHORS_PATH, coauthors);
  console.log(`Wrote ${Object.keys(coauthors).length} coauthor name variants to ${COAUTHORS_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
