// Extracts every news item from the crawled news listing page. Items that
// link to a /news/YYYY/.../ detail page get their full body from that page
// instead of just the listing's short blurb.

import { join } from "node:path";
import { stat } from "node:fs/promises";
import {
  loadPage,
  htmlToMarkdown,
  stripIcons,
  writeMarkdownFile,
  REFERENCE_PAGES_DIR,
  CONTENT_DIR,
} from "./_shared.mjs";

const MONTHS = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function parseDate(text) {
  const match = text.trim().match(/^(\w{3})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) throw new Error(`Unrecognised news date: "${text}"`);
  const [, mon, day, year] = match;
  return `${year}-${MONTHS[mon]}-${day.padStart(2, "0")}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 6)
    .join("-");
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const $ = await loadPage("news");
  const items = $(".news-items > li.news-item");

  let withDetailPage = 0;

  for (const el of items.toArray()) {
    const item = $(el);
    const date = parseDate(item.find(".news-date").first().text());
    const category = item.find(".news-badge").first().text().trim();
    const content = item.find(".news-content").first();
    stripIcons($, item);

    // A "news-title" link means the item's entire blurb is just a titled
    // link — to a /news/ detail page (fetch its full body) or elsewhere
    // on the site (a talk, a teaching page: store title+link in front
    // matter, no body). Anything else is ordinary prose, kept as Markdown.
    const titleLink = content.find("a.news-title").first();
    let title;
    let detailSlug;
    let link;
    let body = "";

    if (titleLink.length > 0 && titleLink.attr("href").startsWith("/news/")) {
      detailSlug = titleLink.attr("href").replace(/^\/news\//, "").replace(/\/$/, "");
      title = titleLink.text().trim();

      const detailPath = join(REFERENCE_PAGES_DIR, "news", detailSlug, "index.html");
      if (await fileExists(detailPath)) {
        const detail$ = await loadPage(join("news", detailSlug));
        const page = detail$(".event-page, .post").first();
        stripIcons(detail$, page);
        title = page.find("h1").first().text().trim() || title;
        body = htmlToMarkdown(page.html() ?? "");
        withDetailPage += 1;
      } else {
        body = htmlToMarkdown(content.html() ?? "");
      }
    } else if (titleLink.length > 0) {
      title = titleLink.text().trim();
      link = titleLink.attr("href");
    } else {
      body = htmlToMarkdown(content.html() ?? "");
    }

    // The original's own slugs are already date-prefixed (e.g.
    // "2024/2024-06-24-phd-colloquium-kartheek"); strip that prefix so it
    // isn't duplicated against the date this file name adds.
    const shortSlug = detailSlug
      ? detailSlug.split("/").pop().replace(new RegExp(`^${date}-`), "")
      : slugify(title ?? body);
    const filePath = join(CONTENT_DIR, "news", `${date}-${shortSlug}.md`);
    await writeMarkdownFile(filePath, { date, category, title, detailSlug, link }, body);
  }

  console.log(`Wrote ${items.length} news items (${withDetailPage} with a full detail-page body).`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
