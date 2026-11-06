import "server-only";
import { cache } from "react";
import { readCollection } from "./collection";
import { articleSchema, type Article } from "./schemas";

export type ArticleWithSlug = Article & { slug: string };

/** Reads every article under content/articles/, newest first. */
export const readArticles = cache(async (): Promise<ArticleWithSlug[]> => {
  const articles = await readCollection("articles", articleSchema);
  return [...articles].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
});
