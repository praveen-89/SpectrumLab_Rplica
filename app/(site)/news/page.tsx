import { Suspense } from "react";
import type { Metadata } from "next";
import { readCollection } from "@/lib/content/collection";
import { newsItemSchema } from "@/lib/content/schemas";
import NewsList from "@/components/NewsList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News",
  alternates: { canonical: "/news/" },
};

async function NewsContent() {
  const news = await readCollection("news", newsItemSchema);
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));
  return <NewsList items={sorted} />;
}

export default function NewsPage() {
  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">News</h1>
        <h2 className="post-description"></h2>
      </header>
      <article data-aos="fade-down">
        <Suspense fallback={null}>
          <NewsContent />
        </Suspense>
      </article>
    </div>
  );
}
