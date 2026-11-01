"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteGalleryEvent } from "@/Admin/backend/actions/gallery-actions";

export type GalleryEventRow = { id: string; title: string; photoCount: number; thumbnail?: string };

function EventCard({ event }: { event: GalleryEventRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleDelete() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteGalleryEvent(event.id);
      router.refresh();
    });
  }

  return (
    <div className="admin-card">
      {event.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.thumbnail} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
      ) : null}
      <span className="admin-card-title">{event.title}</span>
      <span className="admin-card-description">{event.photoCount} photos</span>
      <div className="admin-table-actions" style={{ marginTop: "0.5rem" }}>
        <Link href={`/admin/gallery-events/${event.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
          Edit
        </Link>
        <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleDelete} disabled={pending}>
          {pending ? "Deleting..." : "Delete"}
        </button>
      </div>
      <ConfirmDialog ref={confirmRef} message={`Delete "${event.title}"? This cannot be undone.`} />
    </div>
  );
}

export default function GalleryEventsList({ events }: { events: GalleryEventRow[] }) {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Gallery Photos</h1>
          <p>Photo events shown on the Gallery &gt; Photos page.</p>
        </div>
        <Link href="/admin/gallery-events/new" className="admin-btn admin-btn-primary">
          Add Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="admin-table-wrapper">
          <div className="admin-empty-state">
            <span className="admin-empty-state-heading">No photo events yet</span>
            <Link href="/admin/gallery-events/new" className="admin-btn admin-btn-primary">
              Add your first event
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-card-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
