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
