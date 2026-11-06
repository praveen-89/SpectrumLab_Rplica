import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readData } from "@/lib/content/data";
import { peopleGroupMetaSchema } from "@/lib/content/schemas";
import { readPeopleByGroup } from "@/lib/content/people";
import PeopleGrid from "@/components/PeopleGrid";
import CohortTimeline from "@/components/CohortTimeline";

export const dynamic = "force-dynamic";

const findGroupMeta = cache(async (group: string) => {
  const groups = await readData("people-groups.json", peopleGroupMetaSchema);
  return groups.find((g) => g.group === group);
});

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }): Promise<Metadata> {
  const { group } = await params;
  const meta = await findGroupMeta(group);
  if (!meta) return {};
  return {
    title: meta.title,
    alternates: { canonical: `/people/${group}/` },
  };
}

export default async function PeopleGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const meta = await findGroupMeta(group);
  if (!meta) notFound();

  const people = await readPeopleByGroup(meta.group);

  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">{meta.title}</h1>
        <h2 className="post-description">{meta.description}</h2>
      </header>
      <article data-aos="fade-down">
        <div className="people">
          {meta.group === "mtech-graduates" ? <CohortTimeline people={people} /> : <PeopleGrid people={people} />}
        </div>
      </article>
    </div>
  );
}
