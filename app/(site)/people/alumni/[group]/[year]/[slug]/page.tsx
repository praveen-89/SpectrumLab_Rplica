import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPersonBySlug } from "@/lib/content/people";
import PersonProfile from "@/components/PersonProfile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string; year: string; slug: string }>;
}): Promise<Metadata> {
  const { group, year, slug } = await params;
  const person = await findPersonBySlug(`alumni/${group}/${year}/${slug}`);
  if (!person) return {};
  return {
    title: person.name,
    alternates: { canonical: `/people/alumni/${group}/${year}/${slug}/` },
  };
}

export default async function AlumniPersonPage({
  params,
}: {
  params: Promise<{ group: string; year: string; slug: string }>;
}) {
  const { group, year, slug } = await params;
  const person = await findPersonBySlug(`alumni/${group}/${year}/${slug}`);
  if (!person) notFound();

  return <PersonProfile person={person} />;
}
