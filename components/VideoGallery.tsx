"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryVideo } from "@/lib/content/schemas";
import { UserIcon, CalendarIcon } from "./icons";

export default function VideoGallery({ videos }: { videos: GalleryVideo[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="videos-grid">
      {videos.map((video) => (
        <div className="video-card minimal-card minimal-card--interactive" key={video.youtubeId}>
          {playingId === video.youtubeId ? (
            <div className="video-card__player">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              type="button"
              className="video-card__thumbnail"
              onClick={() => setPlayingId(video.youtubeId)}
              aria-label={`Play ${video.title}`}
            >
              <Image
                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                fill
                sizes="(max-width: 576px) 100vw, 33vw"
              />
              <span className="video-card__play-overlay">▶</span>
            </button>
          )}
          <div className="video-card__content">
            <h3 className="video-card__title">{video.title}</h3>
            {video.speaker && (
              <div className="video-card__speaker">
                <UserIcon size={13} />
                <span>
                  {video.speaker.href ? (
                    <Link href={video.speaker.href} className="coauthor-link">
                      {video.speaker.name}
                    </Link>
                  ) : (
                    video.speaker.name
                  )}
                </span>
              </div>
            )}
            {video.caption && <p className="video-card__desc">{video.caption}</p>}
            {video.date && (
              <div className="video-card__meta">
                <CalendarIcon size={12} />
                <span>{video.date}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
