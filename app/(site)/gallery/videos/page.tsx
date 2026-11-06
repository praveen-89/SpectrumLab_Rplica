import { Suspense } from "react";
import type { Metadata } from "next";
import { readData } from "@/lib/content/data";
import { galleryVideoSchema } from "@/lib/content/schemas";
import VideoGallery from "@/components/VideoGallery";

export const dynamic = "force-dynamic";

const DESCRIPTION = "Research talks, tutorials, and lab activity recordings";

export const metadata: Metadata = {
  title: "Videos",
  description: DESCRIPTION,
  alternates: { canonical: "/gallery/videos/" },
};

async function GalleryVideosContent() {
  const videos = await readData("gallery-videos.json", galleryVideoSchema);

  return (
    <div className="videos-wrapper">
      <div className="container-md py-4">
        <VideoGallery videos={videos} />
      </div>
    </div>
  );
}

export default function GalleryVideosPage() {
  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">Videos</h1>
        <h2 className="post-description">{DESCRIPTION}</h2>
      </header>
      <article data-aos="fade-down">
        <Suspense fallback={null}>
          <GalleryVideosContent />
        </Suspense>
      </article>
    </div>
  );
}
