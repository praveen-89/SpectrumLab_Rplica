import type { Metadata } from "next";
import { readCollection } from "@/lib/content/collection";
import { newsItemSchema } from "@/lib/content/schemas";
import NewsList from "@/components/NewsList";

export const metadata: Metadata = {
  title: "News",
  alternates: { canonical: "/news/" },
};

export default async function NewsPage() {
  const news = await readCollection("news", newsItemSchema);
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="post">
      <header className="post-header">
        <h1 className="post-title">News</h1>
        <h2 className="post-description"></h2>
      </header>
      <article>
        <NewsList items={sorted} />
      </article>
    </div>
  );
}
