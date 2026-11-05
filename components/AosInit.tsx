"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import "aos/dist/aos.css";

// aos.css reads these as body-level attributes to apply the duration/
// easing to every [data-aos] descendant without needing AOS's own JS.
const DURATION_MS = "600";
const EASING = "ease-out-cubic";

function revealAll() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll("[data-aos]:not(.aos-animate)").forEach((el) => {
        el.classList.add("aos-init", "aos-animate");
      });
    });
  });
}

export default function AosInit() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.setAttribute("data-aos-duration", DURATION_MS);
    document.body.setAttribute("data-aos-easing", EASING);
  }, []);

  // AOS's own runtime was dropped: its MutationObserver re-evaluates every
  // [data-aos] element's scroll position on each DOM change and, since it
  // never knew about elements we revealed ourselves, would un-reveal
  // whatever was currently off-screen — replaying the whole page's
  // entrance animation whenever Suspense-streamed content (e.g. a
  // profile's publications list) mounted later. Driving the reveal
  // ourselves, and only ever adding the class, never removing it, makes
  // it strictly one-shot regardless of what mounts later or when.
  useEffect(() => {
    revealAll();

    const observer = new MutationObserver(revealAll);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
