import { Suspense } from "react";
import type { Metadata } from "next";
import { readCollection } from "@/lib/content/collection";
import { readPublications, buildPublicationViews } from "@/lib/content/publications";
import { readCoauthors } from "@/lib/content/coauthors";
import { personSchema } from "@/lib/content/schemas";
import PublicationsBrowser from "@/components/PublicationsBrowser";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Peer-reviewed journal articles, conference papers, and preprints from Spectrum Lab at IISc Bangalore";

export const metadata: Metadata = {
  title: "Publications",
  description: DESCRIPTION,
};

async function PublicationsContent() {
  const [publications, people, coauthors] = await Promise.all([
    readPublications(),
    readCollection("people", personSchema),
    readCoauthors(),
  ]);

  const director = people.find((person) => person.group === "lab-director");
  const directorHref = director ? `/people/${director.slug}/` : undefined;

  const items = await buildPublicationViews(publications, coauthors, directorHref);

  return <PublicationsBrowser items={items} />;
}

export default function PublicationsPage() {
  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">Publications</h1>
        <h2 className="post-description">{DESCRIPTION}</h2>
      </header>
      <article data-aos="fade-down">
        <Suspense fallback={null}>
          <PublicationsContent />
        </Suspense>
      </article>
    </div>
  );
}
