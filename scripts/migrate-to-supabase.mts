// One-time content migration: reads every existing Markdown/JSON/BibTeX
// content file through the real lib/content loaders (so it's validated by
// the exact same Zod schemas the site already relies on), then loads the
// result into Supabase. Safe to re-run — each table is cleared and
// reloaded from the source files, so this always reflects their current
// state rather than accumulating duplicates.
//
// Run with: npm run migrate:supabase
// (tsx --conditions=react-server, matching scripts/check-content.mts —
// needed so the "server-only" guarded lib/content modules load under
// plain Node instead of only inside a Next.js server build.)

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readCollection } from "../lib/content/collection";
import { readData } from "../lib/content/data";
import { readPublications } from "../lib/content/publications";
import { readCoauthors } from "../lib/content/coauthors";
import { readTalks } from "../lib/content/talks";
import { readCourses } from "../lib/content/teaching";
import { readPage } from "../lib/content/page";
import { readArticles } from "../lib/content/articles";
import {
  newsItemSchema,
  personSchema,
  funderSchema,
  grantSchema,
  recognitionItemSchema,
  opportunitiesPageSchema,
  contactPageSchema,
  homePageSchema,
  galleryEventSchema,
  galleryVideoSchema,
} from "../lib/content/schemas";

async function clearAndInsert(supabase: SupabaseClient, table: string, rows: Record<string, unknown>[]) {
  const { error: deleteError } = await supabase.from(table).delete().gt("updated_at", "1970-01-01");
  if (deleteError) throw new Error(`Failed to clear ${table}: ${deleteError.message}`);

  if (rows.length === 0) {
    console.log(`${table.padEnd(16)} 0 rows (nothing to insert)`);
    return;
  }

  const { error: insertError } = await supabase.from(table).insert(rows);
  if (insertError) throw new Error(`Failed to insert into ${table}: ${insertError.message}`);
  console.log(`${table.padEnd(16)} ${rows.length} rows`);
}

function personRow(person: Awaited<ReturnType<typeof readCollection<typeof personSchema>>>[number]) {
  const segments = person.slug.split("/");
  const status = segments[0] as "current" | "alumni";
  const group = segments[1];
  const year = status === "alumni" ? Number(segments[2]) : null;
  const slug = segments[segments.length - 1];
  return { slug, group, status, year, data: person };
}

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // --- pages (home / opportunities / contact) ---
  const home = await readPage("home", homePageSchema);
  const opportunities = await readPage("opportunities", opportunitiesPageSchema);
  const contact = await readPage("contact", contactPageSchema);
  await clearAndInsert(supabase, "pages", [
    { slug: "home", data: home },
    { slug: "opportunities", data: opportunities },
    { slug: "contact", data: contact },
  ]);

  // --- people ---
  const people = await readCollection("people", personSchema);
  await clearAndInsert(supabase, "people", people.map(personRow));

  // --- publications ---
  // NOTE: once lib/content/publications.ts is swapped to read from
  // Supabase (as it now is), readPublications() here no longer reads
  // papers.bib at all — re-running this section would just read Supabase
  // back into Supabase. Left as-is for the historical record of the
  // original one-time cutover; see scripts/backfill-bib-order.mts for
  // how to recompute bib_order directly from papers.bib if ever needed.
  const publications = await readPublications();
  await clearAndInsert(
    supabase,
    "publications",
    publications.map((p, i) => ({ key: p.key, year: p.year, bib_order: i, data: p })),
  );

  // --- coauthors (name-variant -> href map) ---
  const coauthors = await readCoauthors();
  await clearAndInsert(
    supabase,
    "coauthors",
    Object.entries(coauthors).map(([nameKey, href]) => ({ name_key: nameKey, data: { href } })),
  );

  // --- news ---
  const news = await readCollection("news", newsItemSchema);
  await clearAndInsert(
    supabase,
    "news",
    news.map((item) => ({ slug: item.slug, item_date: item.date, data: item })),
  );

  // --- articles ---
  const articles = await readArticles();
  await clearAndInsert(
    supabase,
    "articles",
    articles.map((item) => ({ slug: item.slug, item_date: item.date ?? null, data: item })),
  );

  // --- talks ---
  const talksOrganized = await readTalks("organized");
  const talksDelivered = await readTalks("delivered");
  const talkRow = (kind: "organized" | "delivered") => (talk: Awaited<ReturnType<typeof readTalks>>[number]) => {
    const [year, slug] = talk.slug.split("/");
    return { kind, year: Number(year), slug, data: talk };
  };
  await clearAndInsert(supabase, "talks", [
    ...talksOrganized.map(talkRow("organized")),
    ...talksDelivered.map(talkRow("delivered")),
  ]);

  // --- teaching ---
  const courses = await readCourses();
  await clearAndInsert(
    supabase,
    "teaching",
    courses.map((course) => ({ slug: course.slug, data: course })),
  );

  // --- gallery ---
  const galleryEvents = await readData("gallery-photos.json", galleryEventSchema);
  await clearAndInsert(
    supabase,
    "gallery_events",
    galleryEvents.map((event, i) => ({ data: event, sort_order: i })),
  );
  const galleryVideos = await readData("gallery-videos.json", galleryVideoSchema);
  await clearAndInsert(
    supabase,
    "gallery_videos",
    galleryVideos.map((video, i) => ({ youtube_id: video.youtubeId, data: video, sort_order: i })),
  );

  // --- recognition / grants / funders ---
  const recognition = await readData("recognition.json", recognitionItemSchema);
  await clearAndInsert(supabase, "recognition", recognition.map((item, i) => ({ data: item, sort_order: i })));

  const grantsData = await readData("grants.json", grantSchema);
  await clearAndInsert(supabase, "grants", grantsData.map((item, i) => ({ data: item, sort_order: i })));

  const funders = await readData("funders.json", funderSchema);
  await clearAndInsert(supabase, "funders", funders.map((item, i) => ({ data: item, sort_order: i })));

  // --- site structure config ---
  const navJson = JSON.parse(await readFile(join(process.cwd(), "data", "nav.json"), "utf-8"));
  const siteJson = JSON.parse(await readFile(join(process.cwd(), "data", "site.json"), "utf-8"));
  const peopleGroupsJson = JSON.parse(await readFile(join(process.cwd(), "data", "people-groups.json"), "utf-8"));
  await clearAndInsert(supabase, "site_config", [
    { key: "nav", data: navJson },
    { key: "site", data: siteJson },
    { key: "people-groups", data: peopleGroupsJson },
  ]);

  console.log("\nMigration complete.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
