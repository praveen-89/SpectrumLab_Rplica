// Extracts every person (current + alumni) from their own crawled profile
// page under .reference/pages/people/<current|alumni>/<group>/[year/]<slug>/
// index.html. The lab director (current/lab-director/css) is handled by
// hand (its accordion content is curated, not scraped) and skipped here.

import { join } from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { load } from "cheerio";
import { htmlToMarkdown, writeMarkdownFile, REFERENCE_PAGES_DIR, CONTENT_DIR } from "./_shared.mjs";

// Crawled directory name -> our schema's PersonGroup enum value.
const CURRENT_GROUPS = {
  "phd-students": "phd-students",
  "mtech-students": "mtech-students",
  "mtech-research": "mtech-research",
  "project-associates": "project-associates",
  administrator: "administrator",
  interns: "interns",
  "post-doc": "current-post-docs",
};
const ALUMNI_GROUPS = {
  "phd-graduates": "phd-graduates",
  "mtech-graduates": "mtech-graduates",
  "mtech-research-graduates": "mtech-research-graduates",
  interns: "interns",
  "post-doc": "past-post-docs",
  "research-associates": "research-associates",
};

const LINK_SELECTORS = [
  ["scholar", "ai-google-scholar"],
  ["github", "fa-github"],
  ["linkedin", "fa-linkedin"],
  ["website", "fa-globe"],
  ["orcid", "ai-orcid"],
  ["twitter", "fa-twitter"],
];

function parseLinks($, page) {
  const links = {};
  const emailHref = page.find('.social-icons a[title="Email"]').attr("href");
  if (emailHref) links.email = decodeURIComponent(emailHref.replace(/^mailto:/, ""));
  for (const [field, iconClass] of LINK_SELECTORS) {
    const a = page.find(`.social-icons a i.${iconClass}`).closest("a");
    if (a.length > 0) links[field] = a.attr("href");
  }
  return links;
}

function parseImage(page) {
  const source = page.find("picture source[srcset]").first().attr("srcset");
  if (source) {
    const match = source.match(/(\S+-800\.webp)/);
    if (match) return match[1];
  }
  return page.find("picture img").first().attr("src");
}

async function parsePerson($, group) {
  const page = $(".container.my-5");
  const name = page.find("h1").first().text().trim();
  const image = parseImage(page);
  const links = parseLinks($, page);
  const bioHtml = page.find(".biography-body").first().html();
  const body = htmlToMarkdown(bioHtml ?? "");
  return { name, group, image, links, body };
}

async function walkProfiles(root) {
  const slugs = [];
  async function walk(dir, segments) {
    const entries = await readdir(dir, { withFileTypes: true });
    const hasIndex = entries.some((e) => e.isFile() && e.name === "index.html");
    if (hasIndex && segments.length > 0) {
      slugs.push(segments);
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) await walk(join(dir, entry.name), [...segments, entry.name]);
    }
  }
  await walk(root, []);
  return slugs;
}

async function run(kind, groupMap) {
  const root = join(REFERENCE_PAGES_DIR, "people", kind);
  let count = 0;
  for (const [dirName, group] of Object.entries(groupMap)) {
    const groupRoot = join(root, dirName);
    let profileSegments;
    try {
      profileSegments = await walkProfiles(groupRoot);
    } catch {
      continue; // group has no crawled pages (e.g. no current research associates)
    }
    for (const segments of profileSegments) {
      const htmlPath = join(groupRoot, ...segments, "index.html");
      const html = await readFile(htmlPath, "utf-8");
      const $ = load(html);
      const data = await parsePerson($, group);
      if (!data.name) continue;

      const filePath = join(CONTENT_DIR, "people", kind, dirName, ...segments.slice(0, -1), `${segments.at(-1)}.md`);
      const { body, ...frontMatter } = data;
      await writeMarkdownFile(filePath, frontMatter, body);
      count += 1;
    }
  }
  console.log(`Wrote ${count} people/${kind} profiles.`);
}

await run("current", CURRENT_GROUPS);
await run("alumni", ALUMNI_GROUPS);
