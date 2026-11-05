import type { Metadata } from "next";
import Link from "next/link";
import { readArticles } from "@/lib/content/articles";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Articles",
  description: "In-depth research highlights from Spectrum Lab",
  alternates: { canonical: "/articles/" },
};

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArticlesPage() {
  const articles = await readArticles();

  return (
    <div className="post">
      <header className="post-header">
        <h1 className="post-title">Articles</h1>
        <h2 className="post-description">In-depth research highlights from Spectrum Lab</h2>
      </header>
      <article>
        <ul className="articles-list">
          {articles.map((item) => (
            <li className="article-item" key={item.slug}>
              {item.date && <span className="article-item__date">{formatDate(item.date)}</span>}
              <h3 className="article-item__title">
                <Link href={`/articles/${item.slug}/`}>{item.title}</Link>
              </h3>
              <p className="article-item__excerpt">{item.excerpt}</p>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
