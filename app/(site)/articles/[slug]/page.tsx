import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readArticles } from "@/lib/content/articles";
import { renderMarkdown } from "@/lib/content/markdown";

export const revalidate = 10;

async function findArticle(slug: string) {
  const articles = await readArticles();
  return articles.find((article) => article.slug === slug);
}

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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) notFound();

  const bodyHtml = await renderMarkdown(article.body);

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
      <div className="article-content" data-aos="fade-down" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </div>
  );
}
