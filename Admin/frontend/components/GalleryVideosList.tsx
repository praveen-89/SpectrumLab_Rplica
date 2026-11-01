"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteGalleryVideo } from "@/Admin/backend/actions/gallery-actions";

export type GalleryVideoRow = { id: string; youtubeId: string; title: string };

function VideoCard({ video }: { video: GalleryVideoRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleDelete() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteGalleryVideo(video.id);
      router.refresh();
    });
  }

  return (
    <div className="admin-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
        alt=""
        style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
      />
      <span className="admin-card-title">{video.title}</span>
      <div className="admin-table-actions" style={{ marginTop: "0.5rem" }}>
        <Link href={`/admin/gallery-videos/${video.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
          Edit
        </Link>
        <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleDelete} disabled={pending}>
          {pending ? "Deleting..." : "Delete"}
        </button>
      </div>
      <ConfirmDialog ref={confirmRef} message={`Delete "${video.title}"? This cannot be undone.`} />
    </div>
  );
}

export default function GalleryVideosList({ videos }: { videos: GalleryVideoRow[] }) {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Gallery Videos</h1>
          <p>Shown on the Gallery &gt; Videos page.</p>
        </div>
        <Link href="/admin/gallery-videos/new" className="admin-btn admin-btn-primary">
          Add Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="admin-table-wrapper">
          <div className="admin-empty-state">
            <span className="admin-empty-state-heading">No videos yet</span>
            <Link href="/admin/gallery-videos/new" className="admin-btn admin-btn-primary">
              Add your first video
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-card-grid">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
