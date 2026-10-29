// Extracts the funder/sponsor strip from the home page into data/funders.json.

import { loadPage, writeJsonFile, DATA_DIR } from "./_shared.mjs";
import { join } from "node:path";

const OUT_PATH = join(DATA_DIR, "funders.json");

async function run() {
  const $ = await loadPage(".");
  const slides = $(".swiper-slide");

  const funders = slides
    .map((_, el) => {
      const slide = $(el);
      const img = slide.find("img").first();
      const name = img.attr("alt");
      const logo = img.attr("src");
      if (!name || !logo) return null;
      const link = slide.find("a").first();
      const url = link.length > 0 ? link.attr("href") : undefined;
      return url ? { name, logo, url } : { name, logo };
    })
    .get()
    .filter(Boolean);

  await writeJsonFile(OUT_PATH, funders);
  console.log(`Wrote ${funders.length} funders to ${OUT_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
