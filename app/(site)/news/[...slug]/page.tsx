import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readCollection } from "@/lib/content/collection";
import { newsItemSchema } from "@/lib/content/schemas";
import NewsDetail from "@/components/NewsDetail";

async function findItem(slug: string) {
  const news = await readCollection("news", newsItemSchema);
  return news.find((item) => item.detailSlug === slug);
}

export async function generateStaticParams() {
  const news = await readCollection("news", newsItemSchema);
  return news.filter((item) => item.detailSlug).map((item) => ({ slug: item.detailSlug!.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await findItem(slug.join("/"));
  if (!item) return {};
  return {
    title: item.title,
    alternates: { canonical: `/news/${slug.join("/")}/` },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const item = await findItem(slug.join("/"));
  if (!item) notFound();

  return <NewsDetail item={item} />;
}
