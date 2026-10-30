"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { GalleryEvent } from "@/lib/content/schemas";

export default function PhotoGallery({ events }: { events: GalleryEvent[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<{ src: string; caption?: string } | null>(null);

  function openPhoto(photo: { src: string; caption?: string }) {
    setActive(photo);
    dialogRef.current?.showModal();
  }

  return (
    <div className="photo-gallery">
      {events.map((event, i) => (
        <section className="photo-gallery__event" key={event.title ?? i}>
          {event.title && <h2 className="event-title">{event.title}</h2>}
          {event.description && <p className="event-description">{event.description}</p>}
          <div className="photo-grid">
            {event.photos.map((photo) => (
              <button
                type="button"
                className="photo-grid__item"
                key={photo.src}
                onClick={() => openPhoto(photo)}
                aria-label={photo.caption ?? "Open photo"}
              >
                <Image src={photo.src} alt={photo.caption ?? ""} fill className="photo-grid__image" sizes="(max-width: 576px) 50vw, 25vw" />
              </button>
            ))}
          </div>
        </section>
      ))}

      <dialog ref={dialogRef} className="photo-lightbox" onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}>
        <button type="button" className="photo-lightbox__close" onClick={() => dialogRef.current?.close()} aria-label="Close">
          ×
        </button>
        {active && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- the lightbox shows whichever photo was clicked, at its natural size; not worth a fixed width/height for a one-off full-view image */}
            <img src={active.src} alt={active.caption ?? ""} className="photo-lightbox__image" />
            {active.caption && <p className="photo-lightbox__caption">{active.caption}</p>}
          </>
        )}
      </dialog>
    </div>
  );
}
