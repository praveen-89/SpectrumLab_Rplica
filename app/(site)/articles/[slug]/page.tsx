import { Suspense, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readArticles } from "@/lib/content/articles";
import { renderMarkdown } from "@/lib/content/markdown";

export const dynamic = "force-dynamic";

const findArticle = cache(async (slug: string) => {
  const articles = await readArticles();
  return articles.find((article) => article.slug === slug);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${slug}/` },
  };
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function ArticleContent({ slug }: { slug: string }) {
  const article = await findArticle(slug);
  if (!article) notFound();

  const bodyHtml = await renderMarkdown(article.body);

  return <div className="article-content" data-aos="fade-down" dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) notFound();

  return (
    <div className="article-page">
      <header className="article-header" data-aos="fade-down">
        <h1 className="article-title">{article.title}</h1>
        <p className="article-excerpt">{article.excerpt}</p>
        <div className="article-meta">
          {article.authors.length > 0 && (
            <span className="article-authors">
              {article.authors.map((author, i) => (
                <span key={author.name}>
                  {i > 0 && ", "}
                  {author.href ? (
                    <a href={author.href} target="_blank" rel="noopener noreferrer">
                      {author.name}
                    </a>
                  ) : (
                    author.name
                  )}
                </span>
              ))}
            </span>
          )}
          {article.date && <time className="article-date">{formatDate(article.date)}</time>}
        </div>
      </header>
      <Suspense fallback={null}>
        <ArticleContent slug={slug} />
      </Suspense>
    </div>
  );
}
