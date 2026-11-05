"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

let initialized = false;

export default function AosInit() {
  const pathname = usePathname();

  // This lives in the shared site layout, so it only mounts once — a
  // client-side navigation (<Link>) swaps the page content without
  // remounting it. Re-running this effect on every pathname change (and
  // calling refreshHard, which re-scans the DOM for [data-aos] elements)
  // is what catches each new page's content; without it, only the very
  // first page load would ever get force-revealed, and every page
  // reached by navigating would fall back to AOS's own scroll-triggered
  // reveal instead.
  useEffect(() => {
    if (!initialized) {
      AOS.init({
        duration: 600,
        easing: "ease-out-cubic",
        once: true,
      });
      initialized = true;
    } else {
      AOS.refreshHard();
    }

    // Double rAF: lets the browser paint the initial hidden/offset state
    // first, so the transition to "animate" is actually visible instead
    // of the two states collapsing into the same frame.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll("[data-aos]").forEach((el) => el.classList.add("aos-animate"));
      });
    });
  }, [pathname]);

  return null;
}
