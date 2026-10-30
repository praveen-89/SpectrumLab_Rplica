// Loads every content collection and data file through the real lib/content
// loaders and prints counts, so a broken import or schema mismatch fails
// loudly instead of surfacing later inside a page render.

import { readCollection } from "../lib/content/collection";
import { readData } from "../lib/content/data";
import { readPublications } from "../lib/content/publications";
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
  galleryEventSchema,
  galleryVideoSchema,
} from "../lib/content/schemas";

async function run() {
  const news = await readCollection("news", newsItemSchema);
  console.log(`news: ${news.length} items`);

  const people = await readCollection("people", personSchema);
  console.log(`people: ${people.length} items`);

  const funders = await readData("funders.json", funderSchema);
  console.log(`funders: ${funders.length} items`);

  const publications = await readPublications();
  console.log(`publications: ${publications.length} items`);

  const talksOrganized = await readTalks("organized");
  console.log(`talks/organized: ${talksOrganized.length} items`);

  const talksDelivered = await readTalks("delivered");
  console.log(`talks/delivered: ${talksDelivered.length} items`);

  const grants = await readData("grants.json", grantSchema);
  console.log(`grants: ${grants.length} items`);

  const recognition = await readData("recognition.json", recognitionItemSchema);
  console.log(`recognition: ${recognition.length} items`);

  const courses = await readCourses();
  console.log(`teaching: ${courses.length} items`);

  const opportunities = await readPage("opportunities", opportunitiesPageSchema);
  console.log(`opportunities: ${opportunities.positions.length} positions`);

  const contact = await readPage("contact", contactPageSchema);
  console.log(`contact: ${contact.address.length} address lines`);

  const articles = await readArticles();
  console.log(`articles: ${articles.length} items`);

  const galleryPhotos = await readData("gallery-photos.json", galleryEventSchema);
  console.log(`gallery photo events: ${galleryPhotos.length} (${galleryPhotos.reduce((n, e) => n + e.photos.length, 0)} photos)`);

  const galleryVideos = await readData("gallery-videos.json", galleryVideoSchema);
  console.log(`gallery videos: ${galleryVideos.length} items`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
