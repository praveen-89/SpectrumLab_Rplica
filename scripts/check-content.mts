// Loads every content collection and data file through the real lib/content
// loaders and prints counts, so a broken import or schema mismatch fails
// loudly instead of surfacing later inside a page render.

import { readCollection } from "../lib/content/collection";
import { readData } from "../lib/content/data";
import { readPublications } from "../lib/content/publications";
import { newsItemSchema, personSchema, funderSchema } from "../lib/content/schemas";

async function run() {
  const news = await readCollection("news", newsItemSchema);
  console.log(`news: ${news.length} items`);

  const people = await readCollection("people", personSchema);
  console.log(`people: ${people.length} items`);

  const funders = await readData("funders.json", funderSchema);
  console.log(`funders: ${funders.length} items`);

  const publications = await readPublications();
  console.log(`publications: ${publications.length} items`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
