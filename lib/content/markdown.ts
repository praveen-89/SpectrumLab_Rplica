import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeKatex)
  .use(rehypeStringify, { allowDangerousHtml: true });

// Articles use a "{% youtube VIDEO_ID %}" shortcode (see
// scripts/import/articles.mjs) in place of the original's raw <iframe> —
// expanded here, before the markdown parse, into the same responsive
// wrapper markup the site already uses for talk/news embeds.
const YOUTUBE_SHORTCODE = /\{%\s*youtube\s+([\w-]+)\s*%\}/g;

function expandYouTubeShortcodes(markdown: string): string {
  return markdown.replace(
    YOUTUBE_SHORTCODE,
    (_, videoId: string) =>
      `\n\n<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>\n\n`,
  );
}

/** Renders Markdown (GFM + math) to an HTML string. Imported content contains raw HTML, so it is allowed through. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(expandYouTubeShortcodes(markdown));
  return String(file);
}
