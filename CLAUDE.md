# Spectrum Lab Replica

<!--
Intentional deviations

Compiled list of places where this replica deliberately differs from
https://spectrum.ee.iisc.ac.in/, per the "Fidelity vs bugs" rule below.
Fixed originals bugs (implemented the working version instead of reproducing
the bug):
- Biography text can overflow narrow viewports in the original (relies on
  `hyphens: auto` alone); added `overflow-wrap: break-word` as a safety net.
- Publications "Cite" bibtex block and the year-pagination pill both overflow
  the viewport at 375px in the original (no overflow/responsive handling at
  all); scoped the bibtex block to its own horizontal scroll and shrank the
  pagination pill on narrow screens instead.
- Several headings used non-semantic levels copied from the original's own
  markup (e.g. `<h5>`/`<h6>` card titles skipping levels); retagged to a
  correct h1→h2→h3→h4 hierarchy site-wide, with explicit font-size overrides
  anywhere the retagged element had no class-driven size, to keep the
  original's visual sizing unchanged.
- The original creates a dedicated "✕" close button inside its mobile nav
  drawer, then hides it with `display:none!important` — dead code; the
  original's actual working close control is its hamburger toggler, which
  stays visible and re-clickable (its own JS toggles the drawer on repeat
  clicks). Ours reproduces that working behaviour: the toggler opens and
  closes the drawer, kept above it by raising `#navbar`'s z-index past the
  offcanvas panel's, rather than copying the dead close button.
- Gallery videos: several of the original's YouTube thumbnails are dead/
  expired, showing a generic grey play-button placeholder; ours shows the
  real captured thumbnail for the same videos.
Reproduced originals bugs (kept the broken behaviour, since it's harmless and
faithfully matches the original):
- Talk cards: the title link's full-card overlay sits above the venue link
  and swallows clicks meant for it, matching the original (whose
  `event.stopPropagation()` doesn't actually fix the underlying
  z-index/hit-testing issue).
Approximated / not derivable from the original:
- People list sort order: current members by name, then alumni by year
  (newest first) and name within a year — the original's own tie-break order
  within a year isn't derivable from the rendered page.
Scope reductions for this rebuild:
- Publications page's live bibtex text-search box (`bibsearch.js` in the
  original) was not built; out of scope. The type dropdown and year
  pagination filters are implemented.
- Gallery photos are a plain CSS grid + native `<dialog>` lightbox, not the
  original's per-event Swiper carousels.
- Articles list/detail pages are new pages not present in the original (the
  original 404s and redirects home for both `/articles/` and any article
  slug), added for symmetry with the rest of the site and kept visually
  consistent with it.
Platform substitutions:
- SF Pro (Typekit-only in the original) is not available to this rebuild;
  falls back to the system font stack (-apple-system/BlinkMacSystemFont
  first) instead.
-->

## Goal
Pixel- and URL-faithful replica of https://spectrum.ee.iisc.ac.in/ (originally Jekyll/al-folio), rebuilt with Next.js.

## Stack
- Next.js App Router, TypeScript (strict).
- Bootstrap 5 + react-bootstrap for UI. No other UI library without asking first.
- next-themes for light/dark mode.

## Architecture rules
- Pages are Server Components by default. Add `"use client"` only for interactive parts (dropdowns, toggles, filters, search).
- Content lives in `/content` (Markdown with front matter, `papers.bib`) and `/data` (JSON). Never hard-code content in components.
- Content is read only on the server through typed helpers in `/lib`. Components never touch the filesystem directly.
- Every dynamic route defines `generateStaticParams` so the site can also be statically exported.
- URLs keep the original paths with trailing slashes. Images live under `/public/assets/img/` using the original paths.

## Code style
- Small, focused components; descriptive names; no dead code; no speculative abstractions.
- Comments only where intent is not obvious from the code.
- Code should read as if written by a careful human developer.

## Before finishing any step
Run and fix all errors in:
```
npm run lint
npm run typecheck
npm run build
```
Before finishing any step that changes UI, run `npm run compare` for the affected paths (dev server running), open the PNGs, compare original vs ours side by side, and fix the visible differences. In the Step Report, list the differences you found, which you fixed, and any you intentionally left.

## Fidelity vs bugs
Reproduce the original's look and behaviour, not its bugs. When the original is broken (dead links, overflow, wrong data), implement the working version and list each deviation in the Step Report under "Deviations from original".

## Markdown content and styling
Content rendered from Markdown carries no classes. Style it through a wrapper class with descendant selectors (e.g. `.hero-description p`). When a component needs a specific element (a title link, a badge), put that data in front matter and render the element in JSX.

## Step Report
Every step must end with a report in this exact format:

**Decisions:** any choice not dictated by the prompt, and why
**Checks:** lint / typecheck / build results (pass/fail, warnings)
**Open issues:** anything incomplete, uncertain, or needing my input
**Commit:** hash and message
```
