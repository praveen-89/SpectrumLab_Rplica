import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readTalks } from "@/lib/content/talks";
import TalkDetail from "@/components/TalkDetail";

async function findTalk(year: string, slug: string) {
  const talks = await readTalks("organized");
  return talks.find((talk) => talk.slug === `${year}/${slug}`);
}

export async function generateStaticParams() {
  const talks = await readTalks("organized");
  return talks.map((talk) => {
    const [year, slug] = talk.slug.split("/");
    return { year, slug };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}): Promise<Metadata> {
  const { year, slug } = await params;
  const talk = await findTalk(year, slug);
  if (!talk) return {};
  return {
    title: talk.title,
    alternates: { canonical: `/talks/organized/${year}/${slug}/` },
  };
}

export default async function TalkOrganizedDetailPage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;
  const talk = await findTalk(year, slug);
  if (!talk) notFound();

  return <TalkDetail talk={talk} basePath="organized" />;
}
