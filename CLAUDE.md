# Spectrum Lab Replica

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

## Markdown content and styling
Content rendered from Markdown carries no classes. Style it through a wrapper class with descendant selectors (e.g. `.hero-description p`). When a component needs a specific element (a title link, a badge), put that data in front matter and render the element in JSX.

## Step Report
Every step must end with a report in this exact format:

```
## Step Report — <step name>
**Done:** bullet list of what was built or changed
**Files:** created / modified / deleted, one line each with a short purpose
**Decisions:** any choice not dictated by the prompt, and why
**Checks:** lint / typecheck / build results (pass/fail, warnings)
**Open issues:** anything incomplete, uncertain, or needing my input
**Commit:** hash and message
```
