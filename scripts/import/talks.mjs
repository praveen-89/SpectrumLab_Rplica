// Extracts every talk (organized or delivered) from its own crawled detail
// page under .reference/pages/talks/<dir>/<year>/<slug>/index.html.
//
// The original's template allows a fair amount of bespoke variation per
// entry (e.g. the one SPARC course uses "Instructors"/"Course
// Description"/"Course Goals" instead of "Speakers"/"Abstract"). This
// importer folds any non-Speakers/Host section into a single Markdown
// body — using the first such heading as abstractLabel and the rest as
// Markdown sub-headings — rather than modelling every bespoke heading as
// its own schema field. See the publications-page step's CLAUDE.md
// "Fidelity vs bugs" rule and the Step Report's "Deviations from original".

import { join } from "node:path";
import { readdir } from "node:fs/promises";
import { load } from "cheerio";
import { readFile } from "node:fs/promises";
import { htmlToMarkdown, writeMarkdownFile, REFERENCE_PAGES_DIR, CONTENT_DIR } from "./_shared.mjs";

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
  if (!match) throw new Error(`Unrecognised talk date: "${text}"`);
  const [, month, day, year] = match;
  return `${year}-${MONTHS[month]}-${day.padStart(2, "0")}`;
}

// Splits "<prefix text><a>Name</a><trailing text>" (or plain text with no
// link) into {prefix, name, href, trailing} — trailing is the caller's to
// interpret (e.g. a list item's "(affiliation)").
function splitPersonHtml($, el) {
  const link = el.find("a").first();
  const fullText = el.text().trim().replace(/\s+/g, " ");
  if (link.length > 0) {
    const href = link.attr("href");
    const name = link.text().trim();
    const idx = fullText.indexOf(name);
    const prefix = fullText.slice(0, idx).trim() || undefined;
    const trailing = fullText.slice(idx + name.length).trim();
    return { prefix, name, href, trailing };
  }
  const prefixMatch = fullText.match(/^(Prof\.|Dr\.)\s+(.*)$/);
  if (prefixMatch) {
    return { prefix: prefixMatch[1], name: prefixMatch[2], href: undefined, trailing: "" };
  }
  return { prefix: undefined, name: fullText, href: undefined, trailing: "" };
}

function parseCardSpeaker($, card) {
  const strong = card.find("strong").first();
  // A PhD defense/colloquium entry can have more than one line here
  // (Supervisor, Examiner); joined since the schema holds one string.
  const affiliation =
    card
      .find(".speaker-affiliation")
      .toArray()
      .map((el) => $(el).text().trim())
      .filter(Boolean)
      .join("; ") || undefined;
  const { prefix, name, href } = splitPersonHtml($, strong);
  return { prefix, name, href, affiliation };
}

function parseListSpeaker($, li) {
  const clone = li.clone();
  const fullText = clone.text().trim().replace(/\s+/g, " ");
  const affiliationMatch = fullText.match(/\(([^)]+)\)\s*$/);
  const affiliation = affiliationMatch ? affiliationMatch[1] : undefined;
  if (affiliationMatch) {
    // Drop the trailing "(affiliation)" text node so splitPersonHtml's
    // trailing-text computation isn't confused by it.
    const lastNode = clone.contents().last();
    if (lastNode[0]?.type === "text") {
      lastNode[0].data = lastNode[0].data.replace(/\s*\([^)]+\)\s*$/, "");
    }
  }
  const { prefix, name, href } = splitPersonHtml($, clone);
  return { prefix, name, href, affiliation };
}

function parsePerson($, el) {
  const { prefix, name, href, trailing } = splitPersonHtml($, el);
  const affiliation = trailing.replace(/^\(|\)$/g, "").trim() || undefined;
  return { prefix, name, href, affiliation };
}

function person({ prefix, name, href, affiliation }) {
  return { name, href, affiliation, prefix };
}

async function parseTalk($) {
  const page = $(".talk-page");
  const type = page.find(".talk-header .talk-badge").first().text().trim() || undefined;
  const title = page.find(".talk-title").first().text().trim();

  const metaItems = page.find(".talk-meta-item");
  let date;
  let time;
  let venue;
  let venueUrl;
  metaItems.each((_, el) => {
    const item = $(el);
    if (item.find(".fa-calendar-alt").length > 0) {
      date = parseDate(item.find("span").first().text());
    } else if (item.find(".fa-clock").length > 0) {
      time = item.find("span").first().text().trim();
    } else if (item.find(".fa-map-marker-alt").length > 0) {
      const link = item.find("a").first();
      if (link.length > 0) {
        venueUrl = link.attr("href");
        venue = link.text().trim();
      } else {
        venue = item.find("span").first().text().trim() || undefined;
      }
    }
  });

  const keywords = page
    .find(".talk-keywords .talk-keyword")
    .toArray()
    .map((el) => $(el).text().trim());

  let speakersLabel;
  let speakers = [];
  let host;
  let registerUrl;
  const abstractParts = [];
  let abstractLabel;

  page.find(".talk-section").each((_, el) => {
    const section = $(el);
    const heading = section.find("h2").first().text().trim().replace(/\s+/g, " ");

    const speakerCard = section.find(".talk-speaker-card");
    const speakersList = section.find(".talk-speakers-list");
    if (speakerCard.length > 0) {
      speakersLabel = heading !== "Speaker" ? heading : undefined;
      speakers = [person(parseCardSpeaker($, speakerCard))];
      return;
    }
    if (speakersList.length > 0) {
      speakersLabel = heading !== "Speakers" ? heading : undefined;
      speakers = speakersList
        .find("li")
        .toArray()
        .map((li) => person(parseListSpeaker($, $(li))));
      return;
    }
    if (heading === "Host" || heading === "Hosts") {
      const p = section.find("p").first();
      host = person(parsePerson($, p));
      return;
    }

    const registerLink = section.find("a.btn-primary");
    if (registerLink.length > 0) {
      registerUrl = registerLink.attr("href");
      return;
    }

    // Everything else (Abstract, Course Description/Goals, a trailing
    // unlabelled paragraph) becomes part of the Markdown body.
    const content = section.find(".talk-abstract, .talk-content, .talk-bio").first();
    const html = content.length > 0 ? content.html() : section.html();
    const markdown = htmlToMarkdown(html ?? "");
    if (!markdown) return;
    if (!abstractLabel && heading) {
      abstractLabel = heading;
      abstractParts.push(markdown);
    } else if (heading) {
      abstractParts.push(`**${heading}**\n\n${markdown}`);
    } else {
      abstractParts.push(markdown);
    }
  });

  return {
    title,
    date,
    time,
    type,
    venue,
    venueUrl,
    speakersLabel,
    speakers,
    host,
    keywords,
    abstractLabel,
    links: { url: registerUrl },
    body: abstractParts.join("\n\n"),
  };
}

async function run(dir) {
  const root = join(REFERENCE_PAGES_DIR, "talks", dir);
  const years = (await readdir(root, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  let count = 0;
  for (const year of years) {
    const slugs = (await readdir(join(root, year), { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    for (const slug of slugs) {
      const html = await readFile(join(root, year, slug, "index.html"), "utf-8");
      const $ = load(html);
      const data = await parseTalk($);
      const filePath = join(CONTENT_DIR, "talks", dir, year, `${slug}.md`);
      const { body, ...frontMatter } = data;
      await writeMarkdownFile(filePath, frontMatter, body);
      count += 1;
    }
  }
  console.log(`Wrote ${count} talks/${dir} items.`);
}

await run("organized");
await run("delivered");
