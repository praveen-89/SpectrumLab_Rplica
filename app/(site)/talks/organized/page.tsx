import { Suspense } from "react";
import type { Metadata } from "next";
import { readTalks } from "@/lib/content/talks";
import TalksList from "@/components/TalksList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Talks Organized",
  alternates: { canonical: "/talks/organized/" },
};

async function TalksOrganizedContent() {
  const talks = await readTalks("organized");
  return <TalksList talks={talks} basePath="organized" />;
}

export default function TalksOrganizedPage() {
  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">Talks Organized</h1>
        <h2 className="post-description">Invited talks organized by Prof. Seelamantula and Spectrum Lab team</h2>
      </header>
      <article data-aos="fade-down">
        <Suspense fallback={null}>
          <TalksOrganizedContent />
        </Suspense>
      </article>
    </div>
  );
}
