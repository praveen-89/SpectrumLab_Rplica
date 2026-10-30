// Extracts each in-depth research article from its own crawled Distill.js
// page (.reference/pages/articles/<slug>/index.html, a <d-article> rather
// than the site's usual Jekyll post template) into content/articles/<slug>.md.
//
// Distill-specific features not modelled here (documented as scope cuts in
// the Step Report): <d-contents> (table of contents), <d-cite>/
// <d-bibliography> (hover-citation bibliography — stripped to a plain
// "[citekey]" marker), <d-footnote>. The front matter (title/description/
// authors/dates) comes from the <d-front-matter> JSON block, which every
// article page embeds regardless of the Distill runtime.

import { join } from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { load } from "cheerio";
import TurndownService from "turndown";
import { writeMarkdownFile, REFERENCE_PAGES_DIR, CONTENT_DIR } from "./_shared.mjs";

const MONTHS = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

function parseDate(text) {
  const match = text.trim().match(/^(\w+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return undefined;
  const [, month, day, year] = match;
  return `${year}-${MONTHS[month]}-${day.padStart(2, "0")}`;
}

// Normalizes the article's mixed math delimiters ($…$, \(…\), \[…\]) to
// the $…$/$$…$$ forms remark-math recognizes, and unwraps the original's
// "<div style='text-align:center'>$eq$,<br><br></div>" display-equation
// pattern into a plain $$eq$$ block (KaTeX centers display math itself).
// Returns the HTML with every math span replaced by an opaque placeholder
// token — turndown markdown-escapes underscores/backslashes/asterisks in
// ordinary text, which would otherwise mangle LaTeX source, so the real
// $…$/$$…$$ text is substituted back in only after turndown has run (see
// restoreMath below).
function decodeEntities(text) {
  return text
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeMath(html, mathStore) {
  let result = html
    // One or more "$eq$," / "$eq$." lines separated by <br>, inside a
    // centered div — the original's display-equation (and, once, a
    // two-line aligned-equation) convention. Each line becomes its own
    // $$...$$ block; a trailing "," or "." after the closing $ is the
    // sentence punctuation, not part of the equation.
    .replace(/<div style="text-align: center;">\s*([\s\S]*?)\s*<\/div>/g, (full, inner) => {
      // Only a genuine "$eq$,<br></div>"-style display equation — other
      // centered divs (e.g. the YouTube embed wrapper) pass through
      // untouched.
      if (!inner.trim().startsWith("$")) return full;
      const lines = inner
        .split(/<br>/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => decodeEntities(line.replace(/^\$/, "").replace(/\$[.,]?$/, "")));
      return `\n\n${lines.map((eq) => `$$${eq}$$`).join("\n\n")}\n\n`;
    })
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");

  result = result.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, (match) => {
    const token = `MATHTOKEN${mathStore.length}ENDTOKEN`;
    mathStore.push(decodeEntities(match));
    return token;
  });
  return result;
}

function restoreMath(markdown, mathStore) {
  return markdown.replace(/MATHTOKEN(\d+)ENDTOKEN/g, (_, i) => mathStore[Number(i)]);
}

function stripDCite(html) {
  return html.replace(/<d-cite key="([^"]+)"[^>]*>\s*<\/d-cite>/g, "[$1]");
}

// A YouTube <iframe> (always inside a <figure>, sometimes inside a
// centered <div>) becomes a "{% youtube VIDEO_ID %}" shortcode, expanded
// to a responsive wrapper at render time (see lib/content/markdown.ts).
function convertYouTube($, html) {
  const $$ = load(`<div>${html}</div>`, { decodeEntities: false });
  $$("iframe").each((_, el) => {
    const src = $$(el).attr("src") ?? "";
    const match = src.match(/youtube\.com\/embed\/([\w-]+)/);
    if (!match) return;
    const figure = $$(el).closest("figure");
    const target = figure.length ? figure : $$(el);
    target.replaceWith(`\n\n{% youtube ${match[1]} %}\n\n`);
  });
  return $$("div").first().html() ?? html;
}

// <picture><source .../><img src=... alt=...></picture> -> a plain <img>,
// so turndown emits a normal Markdown image instead of dropping the
// <picture>/<source> wrapper content.
function simplifyPictures($, html) {
  const $$ = load(`<div>${html}</div>`, { decodeEntities: false });
  $$("picture").each((_, el) => {
    const img = $$(el).find("img").first();
    $$(el).replaceWith($$.html(img));
  });
  return $$("div").first().html() ?? html;
}

const turndown = new TurndownService({ headingStyle: "atx", emDelimiter: "_" });
turndown.addRule("figcaption", {
  filter: "figcaption",
  replacement: (content) => `\n\n_${content.trim()}_\n\n`,
});

function articleHtmlToMarkdown(html) {
  let processed = html;
  processed = convertYouTube(null, processed);
  processed = simplifyPictures(null, processed);
  processed = stripDCite(processed);
  const mathStore = [];
  processed = normalizeMath(processed, mathStore);
  const rewritten = processed.replace(/href="https?:\/\/(www\.)?spectrum\.ee\.iisc\.ac\.in/g, 'href="');
  const markdown = turndown.turndown(rewritten).trim();
  return restoreMath(markdown, mathStore);
}

async function parseArticle(slug) {
  const htmlPath = join(REFERENCE_PAGES_DIR, "articles", slug, "index.html");
  const html = await readFile(htmlPath, "utf-8");
  const $ = load(html);

  const scriptText = $("d-front-matter script").first().html() ?? "{}";
  const frontMatter = JSON.parse(scriptText);

  const authors = (frontMatter.authors ?? []).map((a) => ({
    name: a.author,
    href: a.authorURL || undefined,
  }));

  $("d-contents").remove();
  const articleHtml = $("d-article").html() ?? "";
  const body = articleHtmlToMarkdown(articleHtml);

  return {
    title: frontMatter.title,
    excerpt: frontMatter.description,
    date: parseDate(frontMatter.published ?? ""),
    updatedDate: parseDate(frontMatter.updatedDate ?? ""),
    authors,
    body,
  };
}

async function run() {
  const root = join(REFERENCE_PAGES_DIR, "articles");
  const slugs = (await readdir(root, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

  for (const slug of slugs) {
    const data = await parseArticle(slug);
    const { body, ...frontMatter } = data;
    await writeMarkdownFile(join(CONTENT_DIR, "articles", `${slug}.md`), frontMatter, body);
  }
  console.log(`Wrote ${slugs.length} articles.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
