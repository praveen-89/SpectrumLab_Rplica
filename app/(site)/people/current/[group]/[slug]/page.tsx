import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readPeople, findPersonBySlug } from "@/lib/content/people";
import PersonProfile from "@/components/PersonProfile";
import DirectorProfile from "@/components/DirectorProfile";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const people = await readPeople();
  return people
    .filter((person) => person.slug.startsWith("current/"))
    .map((person) => {
      const [, group, slug] = person.slug.split("/");
      return { group, slug };
    });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string; slug: string }>;
}): Promise<Metadata> {
  const { group, slug } = await params;
  const person = await findPersonBySlug(`current/${group}/${slug}`);
  if (!person) return {};
  return {
    title: person.name,
    alternates: { canonical: `/people/current/${group}/${slug}/` },
  };
}

export default async function CurrentPersonPage({
  params,
}: {
  params: Promise<{ group: string; slug: string }>;
}) {
  const { group, slug } = await params;
  const person = await findPersonBySlug(`current/${group}/${slug}`);
  if (!person) notFound();

  return person.group === "lab-director" ? <DirectorProfile person={person} /> : <PersonProfile person={person} />;
}
