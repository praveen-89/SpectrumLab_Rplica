"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Funder } from "@/lib/content/schemas";

// Matches the original's Swiper config: autoplay every 2500ms, 1/2/3
// logos per view below 576px / 576-767px / 768px+.
const AUTOPLAY_DELAY_MS = 2500;

function useSlidesPerView() {
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      setSlidesPerView(width < 576 ? 1 : width < 768 ? 2 : 3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return slidesPerView;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a browser-only API unavailable during SSR
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default function FundingCarousel({ funders }: { funders: Funder[] }) {
  const slidesPerView = useSlidesPerView();
  const prefersReducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

  const goTo = (next: number) => {
    const wrapped = ((next % funders.length) + funders.length) % funders.length;
    setIndex(wrapped);
  };

  // Autoplay only runs while the carousel is actually visible — otherwise
  // a tick scrolls its own track while off-screen for no one to see, and
  // (before the scrollTo fix below) was the second half of what dragged
  // the whole page back to this section on every tick.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion || !inView) return;
    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_DELAY_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-arms on every index change, not just mount
  }, [paused, prefersReducedMotion, inView, index]);

  // Scrolls only the track's own horizontal scroll position — never the
  // window. scrollIntoView() (the previous approach) scrolls any
  // ancestor, including the page itself, when the target isn't already
  // visible, which is exactly what pulled the window down to this section
  // on load and on every autoplay tick.
  useEffect(() => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (track && slide) track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  }, [index]);

  return (
    <div
      className="funding-carousel"
      ref={rootRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="funding-track"
        ref={trackRef}
        role="region"
        aria-label="Funders and sponsors"
        tabIndex={0}
        style={{ "--slides-per-view": slidesPerView } as React.CSSProperties}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") goTo(index + 1);
          if (event.key === "ArrowLeft") goTo(index - 1);
        }}
      >
        {funders.map((funder) => {
          const logo = (
            <Image
              src={funder.logo}
              alt={funder.name}
              width={220}
              height={140}
              className="img-fluid mx-auto d-block"
              sizes="(max-width: 576px) 100vw, 220px"
              loading="lazy"
              style={{ width: 220, height: 140, objectFit: "contain" }}
            />
          );
          return (
            <div className="funding-slide" key={funder.name}>
              {funder.url ? (
                <a href={funder.url} rel="external nofollow noopener" target="_blank">
                  {logo}
                </a>
              ) : (
                logo
              )}
            </div>
          );
        })}
      </div>
      <div className="swiper-pagination">
        {funders.map((funder, i) => (
          <button
            key={funder.name}
            type="button"
            className={`swiper-pagination-bullet${i === index ? " swiper-pagination-bullet-active" : ""}`}
            aria-label={`Go to ${funder.name}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
