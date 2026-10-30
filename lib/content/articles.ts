import "server-only";
import { readCollection } from "./collection";
import { articleSchema, type Article } from "./schemas";

export type ArticleWithSlug = Article & { slug: string };

/** Reads every article under content/articles/, newest first. */
export async function readArticles(): Promise<ArticleWithSlug[]> {
  const articles = await readCollection("articles", articleSchema);
  return [...articles].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
