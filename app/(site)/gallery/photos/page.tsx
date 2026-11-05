import type { Metadata } from "next";
import { readData } from "@/lib/content/data";
import { galleryEventSchema } from "@/lib/content/schemas";
import PhotoGallery from "@/components/PhotoGallery";

export const revalidate = 10;

const DESCRIPTION = "A collection of memorable moments from our lab events and activities";

export const metadata: Metadata = {
  title: "Photos",
  description: DESCRIPTION,
  alternates: { canonical: "/gallery/photos/" },
};

export default async function GalleryPhotosPage() {
  const events = await readData("gallery-photos.json", galleryEventSchema);

  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">Photos</h1>
        <p className="post-description">{DESCRIPTION}</p>
      </header>
      <article data-aos="fade-down">
        <PhotoGallery events={events} />
      </article>
    </div>
  );
}
