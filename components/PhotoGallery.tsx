"use client";

import { useRef, useState } from "react";
import type { GalleryEvent } from "@/lib/content/schemas";
import GallerySwiper from "./GallerySwiper";

function slugify(title: string | undefined, index: number) {
  return (title ?? `event-${index}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PhotoGallery({ events }: { events: GalleryEvent[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<{ src: string; caption?: string } | null>(null);

  function openPhoto(photo: { src: string; caption?: string }, trigger: HTMLElement) {
    restoreFocusRef.current = trigger;
    setActive(photo);
    dialogRef.current?.showModal();
  }

  function closeLightbox() {
    dialogRef.current?.close();
  }

  return (
    <div className="album-container">
      {events.map((event, i) => (
        <section className="event-section" key={event.title ?? i} data-aos="fade-down" data-aos-delay={Math.min(i * 80, 320)}>
          <div className="event-header">
            {event.title && <h2 className="event-title">{event.title}</h2>}
            {event.description && <p className="event-description">{event.description}</p>}
          </div>
          <GallerySwiper photos={event.photos} eventId={slugify(event.title, i)} onPhotoClick={openPhoto} />
        </section>
      ))}

      <dialog
        ref={dialogRef}
        className="photo-lightbox"
        onClick={(e) => e.target === dialogRef.current && closeLightbox()}
        onClose={() => restoreFocusRef.current?.focus()}
      >
        <div className="photo-lightbox__header">
          <h5 className="photo-lightbox__title">Photo</h5>
          <button type="button" className="photo-lightbox__close" onClick={closeLightbox} aria-label="Close">
            ×
          </button>
        </div>
        <div className="photo-lightbox__body">
          {active && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- the lightbox shows whichever photo was clicked, at its natural size; not worth a fixed width/height for a one-off full-view image */}
              <img src={active.src} alt={active.caption ?? ""} className="photo-lightbox__image" />
              {active.caption && <p className="photo-lightbox__caption">{active.caption}</p>}
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
