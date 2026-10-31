"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Pagination, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function GallerySwiper({
  photos,
  eventId,
  onPhotoClick,
}: {
  photos: Array<{ src: string; caption?: string }>;
  eventId: string;
  onPhotoClick: (photo: { src: string; caption?: string }, trigger: HTMLElement) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const loop = photos.length > 1;

  return (
    <>
      <div className="swiper album-swiper">
        <Swiper
          modules={[Pagination, Autoplay, Keyboard]}
          slidesPerView={1}
          spaceBetween={0}
          loop={loop}
          speed={800}
          autoplay={loop ? { delay: 4000, disableOnInteraction: false } : false}
          pagination={{ clickable: true }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          onSlideChange={(swiper: SwiperInstance) => setActiveIndex(swiper.realIndex)}
        >
          {photos.map((photo) => (
            <SwiperSlide key={photo.src} className="d-flex justify-content-center align-items-center">
              <button
                type="button"
                className="album-photo"
                onClick={(event) => onPhotoClick(photo, event.currentTarget)}
                aria-label={photo.caption ?? "Open photo"}
              >
                <Image
                  src={photo.src}
                  alt={photo.caption ?? ""}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 576px) 100vw, 50vw"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="album-caption">
        <h5 id={`caption-${eventId}`}>{photos[activeIndex]?.caption}</h5>
      </div>
    </>
  );
}
