import type { Metadata } from "next";
import { readTalks } from "@/lib/content/talks";
import TalksList from "@/components/TalksList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Talks Delivered",
  alternates: { canonical: "/talks/delivered/" },
};

export default async function TalksDeliveredPage() {
  const talks = await readTalks("delivered");

  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">Talks Delivered</h1>
        <h2 className="post-description">Research talks delivered by Prof. Seelamantula and lab members</h2>
      </header>
      <article data-aos="fade-down">
        <TalksList talks={talks} basePath="delivered" />
      </article>
    </div>
  );
}
