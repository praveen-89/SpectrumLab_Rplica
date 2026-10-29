// Extracts the lab director's profile page: biography, awards, and
// professional activities, plus image and social links.

import { join } from "node:path";
import { loadPage, htmlToMarkdown, stripIcons, writeMarkdownFile, CONTENT_DIR } from "./_shared.mjs";

const PAGE = "people/current/lab-director/css";
const OUT_PATH = join(CONTENT_DIR, "people", "current", "lab-director", "css.md");

function extractLinks($, root) {
  const links = {};
  root.find(".social-icons a.social-icon").each((_, el) => {
    const a = $(el);
    const href = a.attr("href");
    const title = (a.attr("title") ?? "").toLowerCase();
    if (!href) return;
    if (title === "orcid") links.orcid = href;
    else if (title === "google scholar") links.scholar = href;
    else if (title === "twitter") links.twitter = href;
    else if (title === "github") links.github = href;
    else if (title === "linkedin") links.linkedin = href;
    else if (title === "website") links.website = href;
  });
  return links;
}

async function extractHomeSummary() {
  const home$ = await loadPage(".");
  const bio = home$(".lab-director-section .biography-text").first();
  stripIcons(home$, bio);
  bio.find(".read-more-link").remove();
  return htmlToMarkdown(bio.html() ?? "");
}

async function run() {
  const $ = await loadPage(PAGE);
  const root = $("#main-content");

  const name = root.find("h1").first().text().trim();
  const image = root.find("picture img").first().attr("src");
  const links = extractLinks($, root);
  const summary = await extractHomeSummary();

  const biography = root.find(".biography-body").first();
  stripIcons($, biography);
  const biographyMd = htmlToMarkdown(biography.html() ?? "");

  const awardsList = root.find("h6:contains('Awards')").first().next("ul");
  const awardsMd = htmlToMarkdown(awardsList.length ? `<ul>${awardsList.html()}</ul>` : "");

  const activities = root.find("#activitiesAccordion").first();
  stripIcons($, activities);
  activities.find(".badge").each((_, el) => {
    const badge = $(el);
    badge.replaceWith(` (${badge.text().trim()})`);
  });
  const activitiesMd = htmlToMarkdown(activities.html() ?? "");

  const body = [
    "## Biography",
    biographyMd,
    "## Awards",
    awardsMd,
    "## Professional Activities",
    activitiesMd,
  ].join("\n\n");

  await writeMarkdownFile(OUT_PATH, { name, group: "lab-director", image, links, summary }, body);
  console.log(`Wrote director profile to ${OUT_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
