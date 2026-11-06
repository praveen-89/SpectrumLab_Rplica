import "server-only";
import { cache } from "react";
import { readCollection } from "./collection";
import { talkItemSchema, type TalkItem } from "./schemas";

export type TalkWithSlug = TalkItem & { slug: string };

/** Reads content/talks/<dir> (organized or delivered), newest first. */
export const readTalks = cache(async (dir: "organized" | "delivered"): Promise<TalkWithSlug[]> => {
  const items = await readCollection(`talks/${dir}`, talkItemSchema);
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
});
