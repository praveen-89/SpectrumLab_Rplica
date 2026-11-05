import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readTalks } from "@/lib/content/talks";
import TalkDetail from "@/components/TalkDetail";

export const dynamic = "force-dynamic";

async function findTalk(year: string, slug: string) {
  const talks = await readTalks("delivered");
  return talks.find((talk) => talk.slug === `${year}/${slug}`);
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
    alternates: { canonical: `/talks/delivered/${year}/${slug}/` },
  };
}

export default async function TalkDeliveredDetailPage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;
  const talk = await findTalk(year, slug);
  if (!talk) notFound();

  return <TalkDetail talk={talk} basePath="delivered" />;
}
